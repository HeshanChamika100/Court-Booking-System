import { NextRequest, NextResponse } from 'next/server'
import { createBooking, getBookings, isRangeAvailable, isValidSlotForDate, getEffectiveOverride } from '@/lib/supabase'
import { getBookingConfirmationEmail, sendEmail } from '@/lib/email'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const bookings = await getBookings()
    return NextResponse.json({ success: true, data: bookings }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, phone_number, email, booking_date, start_time, end_time, number_of_courts } = body

    // Validate input
    if (!customer_name || !phone_number || !email || !booking_date || !start_time || !end_time || !number_of_courts) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Reject bookings on closed dates
    const override = await getEffectiveOverride(booking_date)
    if (override?.is_closed) {
      return NextResponse.json(
        { success: false, message: 'Bookings are not available on this date.' },
        { status: 400 }
      )
    }

    // Validate slot is within this date's operating hours (respects custom-hour overrides)
    const validSlot = await isValidSlotForDate(booking_date, start_time, end_time)
    if (!validSlot) {
      return NextResponse.json(
        { success: false, message: 'Invalid time slot for this date.' },
        { status: 400 }
      )
    }

    // Validate court count
    if (number_of_courts < 1 || number_of_courts > 6) {
      return NextResponse.json(
        { success: false, message: 'Number of courts must be between 1 and 6.' },
        { status: 400 }
      )
    }

    // Validate court availability
    const available = await isRangeAvailable(booking_date, start_time, end_time, number_of_courts)
    if (!available) {
      return NextResponse.json(
        { success: false, message: 'Not enough courts available for the selected slot.' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await createBooking({
      customer_name,
      phone_number,
      email,
      booking_date,
      start_time,
      end_time,
      number_of_courts,
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send confirmation email
    const confirmationEmail = getBookingConfirmationEmail(
      customer_name,
      format(new Date(booking_date), 'MMMM dd, yyyy'),
      start_time,
      end_time,
      number_of_courts
    )

    await sendEmail(email, confirmationEmail.subject, confirmationEmail.html, confirmationEmail.text)

    return NextResponse.json(
      { success: true, message: 'Booking created successfully', data: booking },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
