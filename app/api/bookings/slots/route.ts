import { NextRequest, NextResponse } from 'next/server'
import { getSlotAvailability } from '@/lib/supabase'

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

    const slots = await getSlotAvailability(date)
    return NextResponse.json({ success: true, data: slots }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching slot availability:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch slot availability' },
      { status: 500 }
    )
  }
}
