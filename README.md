# Badminton Club - Court Booking System

A modern, full-featured court booking system for Badminton Club in Padukka, built with Next.js 16, Supabase, and TypeScript.

Live site: [https://bminton-court-booking-system.vercel.app/](https://bminton-court-booking-system.vercel.app/)

## Features

- **Public Booking Portal**: Customers can easily book badminton courts with real-time availability checking
- **Admin Dashboard**: Manage bookings, approve/decline requests, and track booking statistics
- **Email Notifications**: Automated email confirmations, approvals, and decline notifications
- **WhatsApp Notifications**: Approval alerts sent to the booking phone number when WhatsApp is configured
- **Supabase Integration**: Secure database with Row Level Security (RLS) policies
- **Responsive Design**: Beautiful, mobile-first UI with premium styling
- **Real-time Availability**: Check court availability before booking
- **Multi-court Booking**: Support for booking 1-6 courts simultaneously
- **Status Management**: Track booking status (pending, approved, declined)

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Email**: Nodemailer (SMTP) or Resend
- **Messaging**: Twilio WhatsApp API
- **Deployment**: Vercel

## Project Structure

```
app/
├── page.tsx                  # Public booking homepage
├── admin/
│   ├── page.tsx             # Admin login page
│   └── dashboard/
│       └── page.tsx         # Admin dashboard
├── api/
│   └── bookings/
│       ├── route.ts         # GET/POST bookings
│       └── [id]/route.ts    # PATCH/DELETE specific booking
├── layout.tsx               # Root layout
└── globals.css              # Global styles

components/
└── booking-form.tsx         # Booking form component

lib/
├── supabase.ts             # Supabase client and queries
├── email.ts                # Email templates and sending
└── auth.ts                 # Authentication utilities

public/                      # Static assets
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account
- SMTP email service (Gmail, SendGrid, etc.) or Resend account

### 2. Database Setup

The SQL schema has been created in your Supabase project with the following structure:

**Courts Table**
```sql
CREATE TABLE courts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Bookings Table**
```sql
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  number_of_courts INTEGER NOT NULL CHECK (number_of_courts > 0),
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Booking Status Enum**
```sql
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'declined');
```

**Admin Password Settings Table**
```sql
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

The admin password reset flow stores the active password hash in this table under the `admin_password_hash` key.

Default courts (Court 1-6) have been pre-inserted into the database.
### 3. Install Dependencies

```bash
pnpm install
# or npm install / yarn install
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### For Customers

1. **Visit homepage** at `/`
2. **Fill booking form**:
   - Full Name, Email, Phone Number
   - Booking Date, Number of Courts
   - Start Time and End Time (auto-populated from available slots)
3. **Submit booking request**
4. **Check email** for confirmation

### For Admins

1. **Go to** `/admin`
2. **Login** with the password configured in `ADMIN_PASSWORD`
3. **Dashboard features**:
   - View all bookings and statistics
   - Filter by status (All, Pending, Approved, Declined)
   - Approve pending bookings (sends approval email)
   - Decline bookings (sends decline email)
   - Delete bookings
4. **Logout** when finished

## Email Configuration

### Using Gmail SMTP

1. Enable 2-Factor Authentication in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in environment variables

### Using SendGrid

1. Create SendGrid account and verify sender email
2. Generate API key in Settings
3. Configure:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
```

### Using WhatsApp Notifications

When a booking is approved, the system can send a WhatsApp message to the phone number stored with the booking.

Configure Twilio WhatsApp credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

The booking phone number should be entered in local mobile format like `07XXXXXXXX`. The server normalizes Sri Lankan numbers to WhatsApp E.164 format before sending.

## API Documentation

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "customer_name": "John Doe",
  "phone_number": "+94XXXXXXXXXX",
  "email": "john@example.com",
  "booking_date": "2024-12-25",
  "start_time": "18:00",
  "end_time": "19:00",
  "number_of_courts": 2
}
```

### Get Bookings
```bash
GET /api/bookings
```

### Update Booking Status
```bash
PATCH /api/bookings/[id]
Content-Type: application/json

{
  "status": "approved" | "declined"
}
```

### Delete Booking
```bash
DELETE /api/bookings/[id]
```

## Availability Logic

The system calculates available slots based on:
- Total courts available (6 courts)
- Existing bookings for selected date
- Only approved/pending bookings block availability
- Declined bookings do not affect availability
- 30-minute time slot intervals (6 AM - 10 PM)

## Deployment

### Deploy to Vercel

Live deployment: [https://bminton-court-booking-system.vercel.app/](https://bminton-court-booking-system.vercel.app/)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel Settings
4. Deploy

### Required Environment Variables in Vercel

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_APP_URL`

## Customization

### Change Admin Password
```env
ADMIN_PASSWORD=your_new_password
ADMIN_SESSION_SECRET=generate_a_random_long_secret
```

### Modify Operating Hours
Edit `lib/supabase.ts`, `generateTimeSlots()` function:
```typescript
for (let hour = 6; hour < 22; hour++) { // Change hours as needed
```

### Customize Email Templates
Edit `lib/email.ts` to modify email content, subject lines, and HTML templates.

## Troubleshooting

### Email Not Sending
- Verify SMTP credentials are correct
- For Gmail, use App Password (not regular password)
- Check firewall allows SMTP port 587

### Bookings Not Saving
- Verify Supabase credentials in `.env.local`
- Check database RLS policies are enabled
- Verify tables exist in Supabase

### Admin Login Not Working
- Clear browser cookies for the site
- Verify password matches exactly
- Check `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` environment variables

### Password Reset Not Working
- Verify the `admin_settings` table exists in Supabase
- Check `ADMIN_EMAIL` matches the inbox that receives reset links
- Confirm `NEXT_PUBLIC_APP_URL` points to the correct site URL

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Next.js 16 with Turbopack for faster builds
- Server Components for database queries
- Optimized images and CSS with Tailwind
- Minimal JavaScript bundle size

## Security

- Row Level Security (RLS) at database level
- Password-protected admin access
- Server-side input validation
- Environment variables for sensitive data
- HTTPS recommended for production

## Support

For issues or questions, contact the development team.

## License

Proprietary - Badminton Club, Padukka

## Changelog

### Version 1.0.0 (Current)
- Supabase integration with full database setup
- Premium UI with responsive design
- Email notifications (confirmation, approval, decline)
- Admin dashboard with real-time booking management
- Multi-court booking support (1-6 courts)
- Real-time availability checking
- RLS security policies
