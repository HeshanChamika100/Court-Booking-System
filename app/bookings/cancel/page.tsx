'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2, Trophy, Search, X, Clock } from 'lucide-react'
import { format, parse } from 'date-fns'

type Booking = {
  id: number
  customer_name: string
  phone_number: string
  email: string
  booking_date: string
  start_time: string
  end_time: string
  number_of_courts: number
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  created_at: string
}

export default function CancelBookingPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const handleSearch = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/bookings/search?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.success) {
        setBookings(data.data)
        setSearched(true)
      } else {
        setError(data.message || 'Failed to find bookings')
        setBookings([])
        setSearched(true)
      }
    } catch (err) {
      setError('Failed to search for bookings')
      setBookings([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const canCancel = (booking: Booking): boolean => {
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      return false
    }

    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    const now = new Date()
    const minutesUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60)
    return minutesUntilBooking >= 60
  }

  const getCancellationMessage = (booking: Booking): string => {
    if (booking.status === 'cancelled') {
      return 'Already cancelled'
    }
    if (booking.status === 'declined') {
      return 'Cannot cancel declined booking'
    }

    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    const now = new Date()
    const minutesUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60)

    if (minutesUntilBooking < 60) {
      return `Can only cancel up to 1 hour before booking`
    }

    return ''
  }

  const handleCancel = async (booking: Booking) => {
    if (!canCancel(booking)) return

    setCancellingId(booking.id)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(`Booking cancelled successfully! Check your email for confirmation.`)
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b)))
        setTimeout(() => {
          setSuccess('')
        }, 5000)
      } else {
        setError(data.message || 'Failed to cancel booking')
      }
    } catch (err) {
      setError('Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const upcomingBookings = bookings.filter((b) => {
    const bookingDate = new Date(`${b.booking_date}T${b.start_time}`)
    return bookingDate > new Date() && b.status !== 'declined'
  })

  const pastBookings = bookings.filter((b) => {
    const bookingDate = new Date(`${b.booking_date}T${b.start_time}`)
    return bookingDate <= new Date() || b.status === 'declined'
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/badminton-wallpaper.jpg')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_28%),linear-gradient(135deg,rgba(4,7,14,0.86),rgba(4,7,14,0.62),rgba(4,7,14,0.88))]" />

      <div className="relative z-10 flex flex-col grow">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">Wijaya Sports Club</h1>
                <p className="text-xs text-white/65">Padukka</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-white/20 bg-white/90 text-slate-950 hover:bg-white">
                Back to Booking
              </Button>
            </Link>
          </div>
        </header>

        {/* Main */}
        <main className="container mx-auto px-4 py-8 md:py-12 grow">
          <div className="max-w-2xl mx-auto">
            <Card className="border border-white/20 bg-white/92 p-6 md:p-8 shadow-2xl shadow-black/20 ring-1 ring-white/30 backdrop-blur-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 mb-2">Cancel Your Booking</h2>
              <p className="text-slate-600 mb-6">
                Enter your email to find and cancel your bookings. Cancellations are allowed up to 1 hour before the booking time.
              </p>

              {/* Search Section */}
              <div className="mb-8">
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-900">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-background border-input text-slate-900 placeholder-slate-500"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 flex gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 flex gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-emerald-600 text-sm">{success}</p>
                </div>
              )}

              {/* Results */}
              {searched && bookings.length === 0 && !error && (
                <div className="text-center py-8">
                  <p className="text-slate-600">No bookings found for this email address.</p>
                </div>
              )}

              {bookings.length > 0 && (
                <div className="space-y-6">
                  {/* Upcoming Bookings */}
                  {upcomingBookings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Bookings</h3>
                      <div className="space-y-3">
                        {upcomingBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {format(new Date(`${booking.booking_date}T00:00:00`), 'EEEE, MMMM dd, yyyy')}
                                  </h4>
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                      booking.status === 'approved'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : booking.status === 'pending'
                                          ? 'bg-amber-100 text-amber-700'
                                          : booking.status === 'cancelled'
                                            ? 'bg-slate-100 text-slate-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {booking.number_of_courts} Court{booking.number_of_courts !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleCancel(booking)}
                                disabled={!canCancel(booking) || cancellingId === booking.id}
                                variant={canCancel(booking) ? 'destructive' : 'outline'}
                                size="sm"
                                className="shrink-0"
                              >
                                {cancellingId === booking.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            </div>
                            {!canCancel(booking) && (
                              <p className="text-xs text-slate-500 mt-2">{getCancellationMessage(booking)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Bookings */}
                  {pastBookings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Past Bookings</h3>
                      <div className="space-y-3">
                        {pastBookings.map((booking) => (
                          <div key={booking.id} className="border border-slate-200 rounded-lg p-4 opacity-60">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {format(new Date(`${booking.booking_date}T00:00:00`), 'EEEE, MMMM dd, yyyy')}
                                  </h4>
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                      booking.status === 'cancelled'
                                        ? 'bg-slate-100 text-slate-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/25 py-8 backdrop-blur-xl mt-auto">
          <div className="container mx-auto px-4 text-center text-xs text-white/60">
            <p>&copy; {new Date().getFullYear()} Wijaya Sports Club. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
