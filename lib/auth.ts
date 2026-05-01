export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() ?? ''
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = getAdminPassword()
  return adminPassword.length > 0 && password === adminPassword
}
