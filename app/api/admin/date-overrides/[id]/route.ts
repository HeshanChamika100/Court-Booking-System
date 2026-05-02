import { NextRequest, NextResponse } from 'next/server'
import { deleteDateOverride } from '@/lib/supabase'
import { isAdminRequestAuthorized } from '@/lib/admin-session'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

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
