import { NextRequest, NextResponse } from 'next/server'
import { getDateOverrides, createDateOverride, getBookings } from '@/lib/supabase'

export async function GET() {
  try {
    const overrides = await getDateOverrides()
    return NextResponse.json({ success: true, data: overrides })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to fetch overrides' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, day_of_week, is_closed, open_time, close_time, note, force } = body

    if (!date && day_of_week === undefined) {
      return NextResponse.json(
        { success: false, message: 'Either a specific date or a day_of_week is required' },
        { status: 400 }
      )
    }

    // ── Warning check: find affected bookings ──────────────────────────────
    if (!force) {
      let affectedBookings: Awaited<ReturnType<typeof getBookings>> = []

      if (date) {
        // Specific date: check that date only
        const all = await getBookings({ booking_date: date })
        affectedBookings = all.filter((b) => b.status !== 'declined')
      } else if (day_of_week !== undefined) {
        // Recurring weekday: check next 90 days
        const today = new Date()
        for (let i = 0; i < 90; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          if (d.getDay() === day_of_week) {
            const iso = d.toISOString().split('T')[0]
            const all = await getBookings({ booking_date: iso })
            affectedBookings.push(...all.filter((b) => b.status !== 'declined'))
          }
        }
      }

      if (affectedBookings.length > 0) {
        return NextResponse.json(
          {
            success: false,
            requiresConfirmation: true,
            affectedCount: affectedBookings.length,
            message: `${affectedBookings.length} existing booking${affectedBookings.length !== 1 ? 's' : ''} will be affected. They will NOT be automatically cancelled — you may want to review them manually.`,
          },
          { status: 409 }
        )
      }
    }

    const override = await createDateOverride({
      date: date ?? null,
      day_of_week: day_of_week !== undefined ? day_of_week : null,
      is_closed: is_closed ?? false,
      open_time: open_time ?? null,
      close_time: close_time ?? null,
      note: note ?? null,
    })

    if (!override) {
      return NextResponse.json({ success: false, message: 'Failed to save rule' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: override }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to save rule' }, { status: 500 })
  }
}
