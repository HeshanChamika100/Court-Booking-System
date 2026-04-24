import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('[v0] Supabase credentials not configured. Using demo mode.')
}

// Public client — uses anon key (subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-only admin client — uses service role key (bypasses RLS)
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
  status: 'pending' | 'approved' | 'declined'
  created_at: string
}

export type AdminUser = {
  id: string
  email: string
  created_at: string
}

// Helper functions
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

// The 6 operating slots: 4 PM – 10 PM (1-hour each)
const OPERATING_SLOTS = [
  { start_time: '16:00', end_time: '17:00' },
  { start_time: '17:00', end_time: '18:00' },
  { start_time: '18:00', end_time: '19:00' },
  { start_time: '19:00', end_time: '20:00' },
  { start_time: '20:00', end_time: '21:00' },
  { start_time: '21:00', end_time: '22:00' },
]

export type SlotAvailability = {
  start_time: string
  end_time: string
  total_courts: number
  booked_courts: number
  available_courts: number
}

export async function getSlotAvailability(date: string): Promise<SlotAvailability[]> {
  const bookings = await getBookings({ booking_date: date })
  const courts = await getCourts()
  const totalCourts = courts.length

  return OPERATING_SLOTS.map((slot) => {
    const bookedCourts = bookings
      .filter((booking) => {
        if (booking.status === 'declined') return false
        // Overlap: booking starts before our slot ends AND booking ends after our slot starts
        return booking.start_time < slot.end_time && booking.end_time > slot.start_time
      })
      .reduce((sum, booking) => sum + booking.number_of_courts, 0)

    return {
      start_time: slot.start_time,
      end_time: slot.end_time,
      total_courts: totalCourts,
      booked_courts: bookedCourts,
      available_courts: Math.max(0, totalCourts - bookedCourts),
    }
  })
}

export const VALID_SLOT_STARTS = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
export const VALID_SLOT_ENDS   = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

export async function isRangeAvailable(
  date: string,
  startTime: string,
  endTime: string,
  requiredCourts: number
): Promise<boolean> {
  const bookings = await getBookings({ booking_date: date })
  const courts = await getCourts()
  const totalCourts = courts.length

  // Count courts already booked for any booking that overlaps [startTime, endTime)
  const bookedCourts = bookings
    .filter((booking) => {
      if (booking.status === 'declined') return false
      // Overlap condition: booking starts before our end AND booking ends after our start
      return booking.start_time < endTime && booking.end_time > startTime
    })
    .reduce((sum, booking) => sum + booking.number_of_courts, 0)

  return totalCourts - bookedCourts >= requiredCourts
}

function generateTimeSlots() {
  const slots = []
  for (let hour = 6; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const endHour = minute === 30 ? hour + 1 : hour
      const endMinute = minute === 30 ? 0 : 30
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

      if (endHour < 23) {
        slots.push({ start_time: startTime, end_time: endTime })
      }
    }
  }
  return slots
}
