import { NextRequest, NextResponse } from 'next/server'
import { deleteCourt } from '@/lib/supabase'
import { isAdminRequestAuthorized } from '@/lib/admin-session'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequestAuthorized(_request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const ok = await deleteCourt(parseInt(id))
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Failed to delete court' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Court deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to delete court' }, { status: 500 })
  }
}
