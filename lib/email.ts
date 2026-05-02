import nodemailer from 'nodemailer'
import { Resend } from 'resend'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text: string
}

// Email templates
export function getBookingConfirmationEmail(
  customerName: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  numberOfCourts: number
): EmailTemplate {
  return {
    to: customerName,
    subject: 'Booking Request Received - Wijaya Sports Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Wijaya Sports Club</h1>
          <p style="margin: 10px 0 0 0;">Court Booking Confirmation</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Thank You for Your Booking Request</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Dear ${customerName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            We have received your court booking request. Our admin team will review your request and get back to you shortly with a confirmation or to discuss availability.
          </p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #333;">Booking Details</h3>
            <table style="width: 100%; color: #666;">
              <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${startTime} - ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Number of Courts:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${numberOfCourts}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            You will receive an email notification once your booking has been approved or if we need to discuss any changes.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            This is an automated message. Please do not reply to this email. For inquiries, please contact us directly at info@wijayasports.com
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${customerName},

Thank you for your booking request at Wijaya Sports Club.

Booking Details:
Date: ${bookingDate}
Time: ${startTime} - ${endTime}
Number of Courts: ${numberOfCourts}

Our admin team will review your request and get back to you with confirmation or to discuss availability.

Best regards,
Wijaya Sports Club Team
    `,
  }
}

export function getApprovalEmail(
  customerName: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  numberOfCourts: number
): EmailTemplate {
  return {
    to: customerName,
    subject: 'Your Booking is Approved - Wijaya Sports Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Wijaya Sports Club</h1>
          <p style="margin: 10px 0 0 0;">Booking Approved!</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #28a745; margin-top: 0;">Booking Approved</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Dear ${customerName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Great news! Your court booking has been approved. Your reservation is confirmed for the date and time specified below.
          </p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Confirmed Booking Details</h3>
            <table style="width: 100%; color: #155724;">
              <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${startTime} - ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Number of Courts:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${numberOfCourts}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please arrive 10 minutes before your scheduled time. If you need to make any changes, please contact us as soon as possible.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            For any inquiries, please contact us at info@wijayasports.com
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${customerName},

Great news! Your booking has been approved.

Confirmed Booking Details:
Date: ${bookingDate}
Time: ${startTime} - ${endTime}
Number of Courts: ${numberOfCourts}

Please arrive 10 minutes before your scheduled time.

Best regards,
Wijaya Sports Club Team
    `,
  }
}

export function getDeclinedEmail(customerName: string): EmailTemplate {
  return {
    to: customerName,
    subject: 'Booking Status Update - Wijaya Sports Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Wijaya Sports Club</h1>
          <p style="margin: 10px 0 0 0;">Booking Status Update</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #dc3545; margin-top: 0;">Booking Declined</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Dear ${customerName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Unfortunately, we are unable to accommodate your booking request for the requested date and time. This could be due to unavailable courts or scheduling conflicts.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Please try booking for a different date or time, or contact us directly to discuss alternative options. We look forward to helping you find a suitable time.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please don't hesitate to reach out to us at info@wijayasports.com
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            We hope to see you soon at Wijaya Sports Club!
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${customerName},

Unfortunately, we are unable to accommodate your booking request for the requested date and time.

Please try booking for a different date or time, or contact us directly to discuss alternative options.

Contact us at: info@wijayasports.com

Best regards,
Wijaya Sports Club Team
    `,
  }
}

export function getCancellationEmail(
  customerName: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  numberOfCourts: number
): EmailTemplate {
  return {
    to: customerName,
    subject: 'Booking Cancelled - Wijaya Sports Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Wijaya Sports Club</h1>
          <p style="margin: 10px 0 0 0;">Booking Cancelled</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #ff6b6b; margin-top: 0;">Booking Cancelled</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Dear ${customerName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Your booking has been successfully cancelled. The courts have been released and are now available for other customers to book.
          </p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">Cancelled Booking Details</h3>
            <table style="width: 100%; color: #856404;">
              <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${startTime} - ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Number of Courts:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${numberOfCourts}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you would like to book another time slot, please visit our website to make a new booking request.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            For any inquiries, please contact us at info@wijayasports.com
          </p>
        </div>
      </div>
    `,
    text: `
Dear ${customerName},

Your booking has been successfully cancelled.

Cancelled Booking Details:
Date: ${bookingDate}
Time: ${startTime} - ${endTime}
Number of Courts: ${numberOfCourts}

If you would like to book another time slot, please visit our website to make a new booking request.

Best regards,
Wijaya Sports Club Team
    `,
  }
}

export function getAdminPasswordResetEmail(resetUrl: string): EmailTemplate {
  return {
    to: 'admin',
    subject: 'Reset Your Admin Password - Wijaya Sports Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Wijaya Sports Club</h1>
          <p style="margin: 10px 0 0 0;">Admin Password Reset</p>
        </div>

        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Reset Your Admin Password</h2>
          <p style="color: #666; line-height: 1.6;">
            A password reset was requested for the admin portal. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button does not work, copy and paste this URL into your browser:
          </p>
          <p style="word-break: break-all; color: #0f172a; font-size: 14px;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            This link expires in 30 minutes.
          </p>
        </div>
      </div>
    `,
    text: `
Reset your admin password for Wijaya Sports Club:

${resetUrl}

This link expires in 30 minutes.
    `,
  }
}

// Send email function
export async function sendEmail(to: string, subject: string, html: string, text: string) {
  try {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@wijayasports.com'

    // Use Gmail SMTP first.
    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === '465',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      })

      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      })

      console.log('[v0] Email sent:', info.messageId)
      return true
    }

    // Fall back to Resend if SMTP is not configured.
    const resendApiKey = process.env.RESEND_API_KEY?.trim()
    if (resendApiKey) {
      const resend = new Resend(resendApiKey)
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      })

      if (error) {
        console.error('[v0] Resend error:', error)
        return false
      }

      console.log('[v0] Email sent via Resend:', data?.id)
      return true
    }

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.log('[v0] Email service not configured. Logging email instead:')
      console.log(`[v0] To: ${to}`)
      console.log(`[v0] Subject: ${subject}`)
      console.log(`[v0] HTML Content: ${html.substring(0, 100)}...`)
      return true
    }
  } catch (error) {
    console.error('[v0] Error sending email:', error)
    return false
  }
}
