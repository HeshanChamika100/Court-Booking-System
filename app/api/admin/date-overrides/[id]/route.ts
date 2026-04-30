import { NextRequest, NextResponse } from 'next/server'
import { deleteDateOverride } from '@/lib/supabase'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ok = await deleteDateOverride(parseInt(id))
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Failed to delete rule' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Rule deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to delete rule' }, { status: 500 })
  }
}
