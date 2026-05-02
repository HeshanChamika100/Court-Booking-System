import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('[v0] Supabase credentials not configured. Using demo mode.')
}

// Public client - uses anon key (subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-only admin client - uses service role key (bypasses RLS)
// Only safe to use in API routes / server components, never in client components.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)


// Types for our database
export type Court = {
  id: number
  name: string
  is_active: boolean
  created_at: string
}

export type Booking = {
  id: number
  customer_name: string
  phone_number: string
  email: string
  booking_date: string
  start_time: string
  end_time: string
  number_of_courts: number
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  created_at: string
}

export type AdminUser = {
  id: string
  email: string
  created_at: string
}


export async function getBookings(filters?: { status?: string; booking_date?: string }) {
  let query = supabaseAdmin.from('bookings').select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.booking_date) {
    query = query.eq('booking_date', filters.booking_date)
  }

  const { data, error } = await query

  if (error) {
    console.error('[v0] Error fetching bookings:', error)
    return []
  }
  return data as Booking[]
}

export async function getBookingById(id: number) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[v0] Error fetching booking:', error)
    return null
  }
  return data as Booking
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) {
    console.error('[v0] Error creating booking:', error)
    return null
  }
  return data as Booking
}

export async function updateBookingStatus(id: number, status: 'approved' | 'declined') {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error updating booking:', error)
    return null
  }
  return data as Booking
}

export async function getBookingsByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('email', email)
    .order('booking_date', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching bookings by email:', error)
    return []
  }
  return data as Booking[]
}

export async function cancelBooking(id: number) {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error cancelling booking:', error)
    return null
  }
  return data as Booking
}

export async function deleteBooking(id: number) {
  const { error } = await supabaseAdmin
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[v0] Error deleting booking:', error)
    return false
  }
  return true
}

export async function getAvailableSlots(
  date: string,
  requiredCourts: number
): Promise<{ start_time: string; end_time: string }[]> {
  const bookings = await getBookings({ booking_date: date })
  const courts = await getCourts()

  const totalCourts = courts.length
  const timeSlots = generateTimeSlots()

  const availableSlots = timeSlots.filter((slot) => {
    const bookedCourts = bookings.filter((booking) => {
      const bookingStart = new Date(`2000-01-01T${booking.start_time}`)
      const bookingEnd = new Date(`2000-01-01T${booking.end_time}`)
      const slotStart = new Date(`2000-01-01T${slot.start_time}`)
      const slotEnd = new Date(`2000-01-01T${slot.end_time}`)

      return (
        booking.status !== 'declined' &&
        slotStart < bookingEnd &&
        slotEnd > bookingStart
      )
    }).reduce((sum, booking) => sum + booking.number_of_courts, 0)

    const availableCourts = totalCourts - bookedCourts
    return availableCourts >= requiredCourts
  })

  return availableSlots
}


// ─── Date Overrides ──────────────────────────────────────────────────────────

export type DateOverride = {
  id: number
  date: string | null        // 'YYYY-MM-DD' specific date, or null
  day_of_week: number | null // 0=Sun … 6=Sat recurring rule, or null
  is_closed: boolean
  open_time: string | null   // 'HH:MM', null = use default
  close_time: string | null  // 'HH:MM', null = use default
  note: string | null
  created_at: string
}

export async function getDateOverrides(): Promise<DateOverride[]> {
  const { data, error } = await supabaseAdmin
    .from('date_overrides')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[v0] Error fetching date overrides:', error)
    return []
  }
  return data as DateOverride[]
}

/** Returns the active override for a date: specific-date rule wins over day-of-week rule. */
export async function getEffectiveOverride(date: string): Promise<DateOverride | null> {
  const overrides = await getDateOverrides()
  const specific = overrides.find((o) => o.date === date)
  if (specific) return specific
  const dow = new Date(date + 'T00:00:00').getDay()
  return overrides.find((o) => o.day_of_week === dow && o.date === null) ?? null
}

export async function createDateOverride(
  payload: Omit<DateOverride, 'id' | 'created_at'>
): Promise<DateOverride | null> {
  const { data, error } = await supabaseAdmin
    .from('date_overrides')
    .insert([payload])
    .select()
    .single()
  if (error) {
    console.error('[v0] Error creating date override:', error)
    return null
  }
  return data as DateOverride
}

export async function deleteDateOverride(id: number): Promise<boolean> {
  const { error } = await supabaseAdmin.from('date_overrides').delete().eq('id', id)
  if (error) {
    console.error('[v0] Error deleting date override:', error)
    return false
  }
  return true
}

// ─── Courts ──────────────────────────────────────────────────────────────────

/** Returns only active courts (used for capacity calculations). */
export async function getCourts() {
  const { data, error } = await supabaseAdmin
    .from('courts')
    .select('*')
    .eq('is_active', true)
  if (error) {
    console.error('[v0] Error fetching courts:', error)
    return []
  }
  return data as Court[]
}

/** Returns ALL courts including inactive ones (used for admin management). */
export async function getAllCourts(): Promise<Court[]> {
  const { data, error } = await supabaseAdmin.from('courts').select('*').order('id')
  if (error) {
    console.error('[v0] Error fetching all courts:', error)
    return []
  }
  return data as Court[]
}

export async function createCourt(name: string): Promise<Court | null> {
  const { data, error } = await supabaseAdmin
    .from('courts')
    .insert([{ name, is_active: true }])
    .select()
    .single()
  if (error) {
    console.error('[v0] Error creating court:', error)
    return null
  }
  return data as Court
}

export async function toggleCourtActive(id: number, is_active: boolean): Promise<Court | null> {
  const { data, error } = await supabaseAdmin
    .from('courts')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('[v0] Error toggling court active:', error)
    return null
  }
  return data as Court
}

export async function deleteCourt(id: number): Promise<boolean> {
  const { error } = await supabaseAdmin.from('courts').delete().eq('id', id)
  if (error) {
    console.error('[v0] Error deleting court:', error)
    return false
  }
  return true
}

// ─── Slot generation & availability ─────────────────────────────────────────

const DEFAULT_OPEN = '16:00'
const DEFAULT_CLOSE = '22:00'

function buildOperatingSlots(openTime: string, closeTime: string) {
  const [openH] = openTime.split(':').map(Number)
  const [closeH] = closeTime.split(':').map(Number)
  const slots = []
  for (let h = openH; h < closeH; h++) {
    slots.push({
      start_time: `${String(h).padStart(2, '0')}:00`,
      end_time: `${String(h + 1).padStart(2, '0')}:00`,
    })
  }
  return slots
}

export type SlotAvailability = {
  start_time: string
  end_time: string
  total_courts: number
  booked_courts: number
  available_courts: number
}

export async function getSlotAvailability(
  date: string,
  openTime: string = DEFAULT_OPEN,
  closeTime: string = DEFAULT_CLOSE
): Promise<SlotAvailability[]> {
  const bookings = await getBookings({ booking_date: date })
  const courts = await getCourts()
  const totalCourts = courts.length
  const operatingSlots = buildOperatingSlots(openTime, closeTime)

  return operatingSlots.map((slot) => {
    const bookedCourts = bookings
      .filter((b) => {
        if (b.status === 'declined') return false
        return b.start_time < slot.end_time && b.end_time > slot.start_time
      })
      .reduce((sum, b) => sum + b.number_of_courts, 0)

    return {
      start_time: slot.start_time,
      end_time: slot.end_time,
      total_courts: totalCourts,
      booked_courts: bookedCourts,
      available_courts: Math.max(0, totalCourts - bookedCourts),
    }
  })
}

/**
 * Validates that start_time and end_time form a contiguous multi-slot range
 * within the operating hours for this date (respecting date overrides).
 */
export async function isValidSlotForDate(
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const override = await getEffectiveOverride(date)
  const openTime = override?.open_time ?? DEFAULT_OPEN
  const closeTime = override?.close_time ?? DEFAULT_CLOSE
  const slots = buildOperatingSlots(openTime, closeTime)
  const starts = slots.map((s) => s.start_time)
  const ends = slots.map((s) => s.end_time)
  const si = starts.indexOf(startTime)
  const ei = ends.indexOf(endTime)
  return si !== -1 && ei !== -1 && si <= ei
}

export async function isRangeAvailable(
  date: string,
  startTime: string,
  endTime: string,
  requiredCourts: number
): Promise<boolean> {
  const bookings = await getBookings({ booking_date: date })
  const courts = await getCourts()
  const totalCourts = courts.length

  const bookedCourts = bookings
    .filter((b) => {
      if (b.status === 'declined') return false
      return b.start_time < endTime && b.end_time > startTime
    })
    .reduce((sum, b) => sum + b.number_of_courts, 0)

  return totalCourts - bookedCourts >= requiredCourts
}
