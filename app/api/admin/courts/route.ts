import { NextRequest, NextResponse } from 'next/server'
import { getAllCourts, createCourt } from '@/lib/supabase'
import { isAdminRequestAuthorized } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const courts = await getAllCourts()
    return NextResponse.json({ success: true, data: courts })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Court name is required' }, { status: 400 })
    }
    const court = await createCourt(name.trim())
    if (!court) {
      return NextResponse.json({ success: false, message: 'Failed to create court' }, { status: 500 })
    }
    return NextResponse.json({ success: true, data: court }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to create court' }, { status: 500 })
  }
}
