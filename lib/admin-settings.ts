import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

const ADMIN_PASSWORD_KEY = 'admin_password_hash'

type AdminPasswordRecord = {
  salt: string
  hash: string
  updatedAt: string
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')
}

function createPasswordRecord(password: string): AdminPasswordRecord {
  const salt = crypto.randomBytes(16).toString('hex')
  return {
    salt,
    hash: hashPassword(password, salt),
    updatedAt: new Date().toISOString(),
  }
}

function parsePasswordRecord(value: string | null | undefined): AdminPasswordRecord | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<AdminPasswordRecord>
    if (!parsed.salt || !parsed.hash) return null
    return {
      salt: parsed.salt,
      hash: parsed.hash,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export async function getStoredAdminPasswordRecord(): Promise<AdminPasswordRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', ADMIN_PASSWORD_KEY)
    .maybeSingle()

  if (error) {
    console.error('[v0] Error fetching admin password record:', error)
    return null
  }

  return parsePasswordRecord(data?.value)
}

export async function setStoredAdminPassword(password: string): Promise<boolean> {
  const record = createPasswordRecord(password)
  const { error } = await supabaseAdmin.from('admin_settings').upsert(
    {
      key: ADMIN_PASSWORD_KEY,
      value: JSON.stringify(record),
      updated_at: record.updatedAt,
    },
    { onConflict: 'key' }
  )

  if (error) {
    console.error('[v0] Error saving admin password record:', error)
    return false
  }

  return true
}

export async function verifyStoredAdminPassword(password: string): Promise<boolean> {
  const stored = await getStoredAdminPasswordRecord()
  if (!stored) {
    return password === (process.env.ADMIN_PASSWORD?.trim() ?? '')
  }

  return hashPassword(password, stored.salt) === stored.hash
}

export function getConfiguredAdminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() ?? ''
}