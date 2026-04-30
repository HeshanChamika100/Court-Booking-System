import { NextRequest, NextResponse } from 'next/server'
import { toggleCourtActive } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { is_active } = await request.json()
    const court = await toggleCourtActive(parseInt(id), is_active)
    if (!court) {
      return NextResponse.json({ success: false, message: 'Failed to update court' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data: court })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to update court' }, { status: 500 })
  }
}
