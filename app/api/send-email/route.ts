import { NextRequest, NextResponse } from 'next/server';

interface EmailRequest {
  to: string;
  subject: string;
  bookingId: string;
  customerName: string;
  status: 'approved' | 'declined' | 'confirmation';
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  numberOfCourts?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { to, subject, status, bookingId, customerName, bookingDate, startTime, endTime, numberOfCourts } = body;

    // In a real implementation, you would use an email service like Resend, SendGrid, or Nodemailer
    // For now, we'll log the email and return success
    console.log('[Email Service] Sending email to:', to);
    console.log('[Email Service] Subject:', subject);
    console.log('[Email Service] Booking Status:', status);
    console.log('[Email Service] Booking Details:', {
      bookingId,
      customerName,
      bookingDate,
      startTime,
      endTime,
      numberOfCourts,
    });

    // Generate email content based on status
    let emailContent = '';
    if (status === 'confirmation') {
      emailContent = generateConfirmationEmail(customerName, bookingDate, startTime, endTime, numberOfCourts);
    } else if (status === 'approved') {
      emailContent = generateApprovalEmail(customerName, bookingDate, startTime, endTime, numberOfCourts);
    } else if (status === 'declined') {
      emailContent = generateDeclineEmail(customerName);
    }

    console.log('[Email Service] Email Content:\n', emailContent);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Email would be sent in production',
        email: {
          to,
          subject,
          status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Email Service] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function generateConfirmationEmail(
  name: string,
  date?: string,
  startTime?: string,
  endTime?: string,
  numberOfCourts?: number
): string {
  return `
Dear ${name},

Thank you for submitting your court booking request at Wijaya Sports Club - Padukka.

Booking Details:
- Date: ${date}
- Time: ${startTime} to ${endTime}
- Number of Courts: ${numberOfCourts}

Your booking is currently pending approval. Our admin team will review your request and send you a confirmation or decline email shortly.

Best regards,
Wijaya Sports Club Admin Team
  `.trim();
}

function generateApprovalEmail(
  name: string,
  date?: string,
  startTime?: string,
  endTime?: string,
  numberOfCourts?: number
): string {
  return `
Dear ${name},

Congratulations! Your court booking has been APPROVED.

Booking Confirmed:
- Date: ${date}
- Time: ${startTime} to ${endTime}
- Number of Courts: ${numberOfCourts}

Please arrive 10 minutes before your scheduled time. If you need to make any changes, please contact us as soon as possible.

Thank you for choosing Wijaya Sports Club - Padukka!

Best regards,
Wijaya Sports Club Admin Team
  `.trim();
}

function generateDeclineEmail(name: string): string {
  return `
Dear ${name},

Thank you for your interest in booking courts at Wijaya Sports Club - Padukka.

Unfortunately, your booking request has been DECLINED. This may be due to:
- The requested time slot is not available
- The requested number of courts are not available for your selected time

Please feel free to submit another booking request for a different date or time.

Best regards,
Wijaya Sports Club Admin Team
  `.trim();
}
