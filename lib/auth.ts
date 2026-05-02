import { verifyStoredAdminPassword } from '@/lib/admin-settings'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return verifyStoredAdminPassword(password)
}
