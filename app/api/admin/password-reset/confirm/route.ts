import { NextRequest, NextResponse } from 'next/server'
import { setStoredAdminPassword } from '@/lib/admin-settings'
import { verifyAdminPasswordResetToken } from '@/lib/admin-reset'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token : ''
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Reset token and new password are required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    const payload = verifyAdminPasswordResetToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Reset link is invalid or expired.' }, { status: 400 })
    }

    const ok = await setStoredAdminPassword(newPassword)
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Failed to update admin password.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Admin password updated successfully.' })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to reset admin password.' }, { status: 500 })
  }
}