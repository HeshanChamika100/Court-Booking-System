import { NextRequest, NextResponse } from 'next/server'
import { getBookingById, updateBookingStatus, deleteBooking } from '@/lib/supabase'
import { getApprovalEmail, getDeclinedEmail, sendEmail } from '@/lib/email'
import { format } from 'date-fns'
import { formatTimeWithoutSeconds } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookingId = parseInt(id)
    const booking = await getBookingById(bookingId)

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: booking }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookingId = parseInt(id)
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'approved', 'declined'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get booking before updating to get customer details
    const booking = await getBookingById(bookingId)

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    // Before approving: verify there is still enough capacity
    // (two pending bookings for the same slot could both have passed the submit-time check)
    if (status === 'approved') {
      const { getBookings: fetchBookings, getCourts: fetchCourts } = await import('@/lib/supabase')
      const [existingBookings, courts] = await Promise.all([
        fetchBookings({ booking_date: booking.booking_date }),
        fetchCourts(),
      ])
      const totalCourts = courts.length

      // Count courts already approved for overlapping slots (exclude the booking being approved)
      const alreadyApproved = existingBookings
        .filter((b) =>
          b.id !== bookingId &&
          b.status === 'approved' &&
          b.start_time < booking.end_time &&
          b.end_time > booking.start_time
        )
        .reduce((sum, b) => sum + b.number_of_courts, 0)

      if (alreadyApproved + booking.number_of_courts > totalCourts) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot approve: only ${totalCourts - alreadyApproved} court(s) available for ${formatTimeWithoutSeconds(booking.start_time)}–${formatTimeWithoutSeconds(booking.end_time)} on ${booking.booking_date}. This booking requests ${booking.number_of_courts}.`,
          },
          { status: 409 }
        )
      }
    }

    // Update booking status
    const updatedBooking = await updateBookingStatus(bookingId, status as 'approved' | 'declined')

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, message: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Send status update email
    let emailTemplate
    if (status === 'approved') {
      emailTemplate = getApprovalEmail(
        booking.customer_name,
        format(new Date(booking.booking_date), 'MMMM dd, yyyy'),
        formatTimeWithoutSeconds(booking.start_time),
        formatTimeWithoutSeconds(booking.end_time),
        booking.number_of_courts
      )
    } else {
      emailTemplate = getDeclinedEmail(booking.customer_name)
    }

    await sendEmail(booking.email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)

    return NextResponse.json(
      { success: true, message: `Booking ${status}`, data: updatedBooking },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error updating booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookingId = parseInt(id)
    const success = await deleteBooking(bookingId)

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Booking deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error deleting booking:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
