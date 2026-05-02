import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequestAuthorized } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ success: true, authenticated: true })
}