import crypto from 'crypto'

type ResetTokenPayload = {
  email: string
  expiresAt: number
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30

function getResetSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || ''
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createAdminPasswordResetToken(email: string): string | null {
  const secret = getResetSecret()
  if (!secret) return null

  const payload: ResetTokenPayload = {
    email,
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
  }

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = sign(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export function verifyAdminPasswordResetToken(token: string): ResetTokenPayload | null {
  const secret = getResetSecret()
  if (!secret) return null

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expectedSignature = sign(encodedPayload, secret)
  const signatureBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

  if (signatureBuffer.length !== expectedBuffer.length) return null
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as ResetTokenPayload
    if (!payload.email || typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}