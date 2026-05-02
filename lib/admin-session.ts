import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'admin_session'

const SESSION_DURATION_SECONDS = 60 * 60 * 8

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || ''
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret()
  if (!secret) return null

  const payload = JSON.stringify({
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  })

  const encodedPayload = Buffer.from(payload, 'utf8').toString('base64url')
  const signature = sign(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false

  const secret = getSessionSecret()
  if (!secret) return false

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return false

  const expectedSignature = sign(encodedPayload, secret)
  const signatureBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

  if (signatureBuffer.length !== expectedBuffer.length) return false
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
      expiresAt?: number
    }

    return typeof payload.expiresAt === 'number' && payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function isAdminRequestAuthorized(request: NextRequest): boolean {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export function setAdminSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}