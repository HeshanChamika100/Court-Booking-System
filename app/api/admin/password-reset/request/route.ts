import { NextRequest, NextResponse } from 'next/server'
import { createAdminPasswordResetToken } from '@/lib/admin-reset'
import { getAdminPasswordResetEmail, sendEmail } from '@/lib/email'
import { getConfiguredAdminEmail } from '@/lib/admin-settings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const configuredEmail = getConfiguredAdminEmail().toLowerCase()

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 })
    }

    if (!configuredEmail) {
      return NextResponse.json(
        { success: false, message: 'Admin email is not configured.' },
        { status: 500 }
      )
    }

    if (email === configuredEmail) {
      const token = createAdminPasswordResetToken(configuredEmail)
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Password reset is not available right now.' },
          { status: 500 }
        )
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || request.nextUrl.origin
      const resetUrl = `${baseUrl}/admin/reset?token=${encodeURIComponent(token)}`
      const template = getAdminPasswordResetEmail(resetUrl)
      await sendEmail(configuredEmail, template.subject, template.html, template.text)
    }

    return NextResponse.json({ success: true, message: 'If the email matches the admin account, a reset link has been sent.' })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to request password reset.' }, { status: 500 })
  }
}