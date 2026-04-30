import { NextRequest, NextResponse } from 'next/server'
import { toggleCourtActive, renameCourt, deleteCourt } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Rename
    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 })
      }
      const court = await renameCourt(parseInt(id), body.name.trim())
      if (!court) {
        return NextResponse.json({ success: false, message: 'Failed to rename court' }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: court })
    }

    // Toggle active
    if (body.is_active !== undefined) {
      const court = await toggleCourtActive(parseInt(id), body.is_active)
      if (!court) {
        return NextResponse.json({ success: false, message: 'Failed to update court' }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: court })
    }

    return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to update court' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
