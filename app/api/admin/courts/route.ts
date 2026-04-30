import { NextRequest, NextResponse } from 'next/server'
import { getAllCourts, createCourt } from '@/lib/supabase'

export async function GET() {
  try {
    const courts = await getAllCourts()
    return NextResponse.json({ success: true, data: courts })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
