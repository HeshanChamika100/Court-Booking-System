import { NextRequest, NextResponse } from 'next/server'
import { getBookingById, cancelBooking } from '@/lib/supabase'
import { getCancellationEmail, sendEmail } from '@/lib/email'
import { format } from 'date-fns'
import { formatTimeWithoutSeconds } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookingId = parseInt(id)
    const body = await request.json()
    const { email } = body

    // Get booking
    const booking = await getBookingById(bookingId)

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify email matches
    if (booking.email !== email) {
      return NextResponse.json(
        { success: false, message: 'Email does not match booking' },
        { status: 403 }
      )
    }

    // Check if booking is already cancelled or declined
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    if (booking.status === 'declined') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a declined booking' },
        { status: 400 }
      )
    }

    // Check if booking is more than 1 hour away
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    const now = new Date()
    const timeUntilBooking = bookingDateTime.getTime() - now.getTime()
    const minutesUntilBooking = timeUntilBooking / (1000 * 60)

    if (minutesUntilBooking < 60) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cancellations are only allowed up to 1 hour before the booking time',
        },
        { status: 400 }
      )
    }

    // Cancel booking
    const cancelledBooking = await cancelBooking(bookingId)

    if (!cancelledBooking) {
      return NextResponse.json(
        { success: false, message: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    // Send cancellation email
    const cancellationEmail = getCancellationEmail(
      booking.customer_name,
      format(new Date(booking.booking_date), 'MMMM dd, yyyy'),
      formatTimeWithoutSeconds(booking.start_time),
      formatTimeWithoutSeconds(booking.end_time),
      booking.number_of_courts
    )

    await sendEmail(booking.email, cancellationEmail.subject, cancellationEmail.html, cancellationEmail.text)

    return NextResponse.json(
      {
        success: true,
        message: 'Booking cancelled successfully',
        data: cancelledBooking,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error cancelling booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
