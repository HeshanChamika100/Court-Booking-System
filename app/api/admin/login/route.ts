import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/admin-session'
import { verifyAdminPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const password = typeof body.password === 'string' ? body.password : ''

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ success: false, message: 'Invalid admin password.' }, { status: 401 })
    }

    const token = createAdminSessionToken()
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin password is not configured on the server.' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ success: true })
    setAdminSessionCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to sign in.' }, { status: 500 })
  }
}