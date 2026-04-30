import { NextRequest, NextResponse } from 'next/server'
import { getSlotAvailability, getEffectiveOverride } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, message: 'A valid date parameter (YYYY-MM-DD) is required' },
        { status: 400 }
      )
    }

    // Check if this date has an override (closed or custom hours)
    const override = await getEffectiveOverride(date)

    if (override?.is_closed) {
      return NextResponse.json(
        { success: true, closed: true, note: override.note, data: [] },
        { status: 200 }
      )
    }

    const openTime  = override?.open_time  ?? '16:00'
    const closeTime = override?.close_time ?? '22:00'

    const slots = await getSlotAvailability(date, openTime, closeTime)
    return NextResponse.json({ success: true, closed: false, data: slots }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching slot availability:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch slot availability' },
      { status: 500 }
    )
  }
}
