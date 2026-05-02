function normalizeWhatsAppRecipient(phoneNumber: string): string | null {
  const trimmed = phoneNumber.trim()

  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('whatsapp:+')) {
    return trimmed
  }

  if (trimmed.startsWith('+')) {
    return `whatsapp:${trimmed}`
  }

  const digits = trimmed.replace(/\D/g, '')

  if (!digits) {
    return null
  }

  if (digits.length === 10 && digits.startsWith('0')) {
    return `whatsapp:+94${digits.slice(1)}`
  }

  if (digits.length === 9) {
    return `whatsapp:+94${digits}`
  }

  if (digits.startsWith('94')) {
    return `whatsapp:+${digits}`
  }

  return `whatsapp:+${digits}`
}

export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim()

    if (!accountSid || !authToken || !fromNumber) {
      console.log('[v0] WhatsApp service not configured. Skipping notification.')
      return false
    }

    const toNumber = normalizeWhatsAppRecipient(phoneNumber)

    if (!toNumber) {
      console.error('[v0] Invalid WhatsApp phone number:', phoneNumber)
      return false
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: toNumber,
          Body: message,
        }).toString(),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] WhatsApp error:', response.status, errorText)
      return false
    }

    const data = await response.json()
    console.log('[v0] WhatsApp notification sent:', data.sid)
    return true
  } catch (error) {
    console.error('[v0] Error sending WhatsApp notification:', error)
    return false
  }
}