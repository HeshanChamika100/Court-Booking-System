import { NextRequest, NextResponse } from 'next/server'
import { getBookingsByEmail } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const bookings = await getBookingsByEmail(email)

    return NextResponse.json({ success: true, data: bookings }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error searching bookings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to search bookings' },
      { status: 500 }
    )
  }
}
