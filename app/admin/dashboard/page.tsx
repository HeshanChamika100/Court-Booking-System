'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, Trash2, LogOut, Calendar, Clock, Home, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { type Booking } from '@/lib/supabase'
import { CourtManagement } from '@/components/court-management'
import { formatTimeTo12Hour } from '@/lib/utils'

export default function AdminDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')
  const [activeTab, setActiveTab] = useState<'bookings' | 'courts'>('bookings')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
    } else {
      loadBookings()
    }
  }, [router])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) setBookings(data.data)
      else console.error('[v0] Error loading bookings:', data.message)
    } catch (err) {
      console.error('[v0] Error loading bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    setActionLoading(id)
    setActionError('')
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      const data = await res.json()
      if (data.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? data.data : b)))
      } else {
        setActionError(data.message || 'Failed to approve booking.')
        setTimeout(() => setActionError(''), 6000)
      }
    } catch (err) {
      console.error('[v0] Error approving booking:', err)
      setActionError('An unexpected error occurred.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (id: number) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      })
      const data = await res.json()
      if (data.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? data.data : b)))
      } else {
        console.error('[v0] Error declining booking:', data.message)
      }
    } catch (err) {
      console.error('[v0] Error declining booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setActionLoading(id)
      try {
        const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          setBookings((prev) => prev.filter((b) => b.id !== id))
        } else {
          console.error('[v0] Error deleting booking:', data.message)
        }
      } catch (err) {
        console.error('[v0] Error deleting booking:', err)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_login_time')
    router.push('/admin')
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    declined: bookings.filter((b) => b.status === 'declined').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-yellow-600/10 text-yellow-300 text-xs font-semibold rounded-full ring-1 ring-yellow-600/10">
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-green-600/10 text-green-300 text-xs font-semibold rounded-full ring-1 ring-green-600/10">
            Approved
          </span>
        )
      case 'declined':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-red-600/10 text-red-300 text-xs font-semibold rounded-full ring-1 ring-red-600/10">
            Declined
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/badminton-wallpaper-admin.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-sm text-white/75">Manage court bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-white/90 text-slate-900 hover:bg-white">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Booking</span>
              </Button>
            </Link>
            <Button onClick={handleLogout} size="sm" className="bg-red-600 text-white hover:bg-red-700">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-sm shadow-xl">
            <p className="text-sm text-white/85 mb-2">Total Bookings</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none drop-shadow-md">{stats.total}</p>
          </Card>
          <Card className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-sm shadow-xl">
            <p className="text-sm text-white/85 mb-2 flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-yellow-400/90" />Pending</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none drop-shadow-md">{stats.pending}</p>
          </Card>
          <Card className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-sm shadow-xl">
            <p className="text-sm text-white/85 mb-2 flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-emerald-400/90" />Approved</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none drop-shadow-md">{stats.approved}</p>
          </Card>
          <Card className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-sm shadow-xl">
            <p className="text-sm text-white/85 mb-2 flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-rose-400/90" />Declined</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none drop-shadow-md">{stats.declined}</p>
          </Card>
        </div>

        {/* Tab switcher */}
        <nav className="mb-6" role="tablist" aria-label="Admin sections">
          <div className="inline-flex rounded-t-lg bg-slate-700/30 p-1">
            <button
              role="tab"
              aria-selected={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              className={
                (activeTab === 'bookings'
                  ? 'px-4 py-2 text-sm font-medium rounded-t-md bg-white text-slate-900 -mb-px border-b-4 border-sky-500 shadow-sm'
                  : 'px-4 py-2 text-sm text-white/80 hover:text-white')
              }
            >
              Bookings
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'courts'}
              onClick={() => setActiveTab('courts')}
              className={
                (activeTab === 'courts'
                  ? 'px-4 py-2 text-sm font-medium rounded-t-md bg-white text-slate-900 -mb-px border-b-4 border-sky-500 shadow-sm'
                  : 'px-4 py-2 text-sm text-white/80 hover:text-white')
              }
            >
              Court Management
            </button>
          </div>
        </nav>

        {activeTab === 'courts' ? (
          <CourtManagement />
        ) : (<>

        {actionError && (
          <div className="flex gap-3 p-4 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-destructive text-sm">{actionError}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'declined'] as const).map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Bookings Table */}
        <Card className="rounded-2xl bg-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-700/30 bg-transparent">
            <h2 className="text-lg font-semibold text-white">Bookings</h2>
            <p className="text-sm text-white/75">Showing {filteredBookings.length} of {bookings.length} bookings</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-white/75">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-white/75">No bookings found</p>
              </div>
            ) : (
              <>
                {/* Mobile list view */}
                <div className="md:hidden p-4 space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-4 bg-slate-900/60 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{booking.customer_name}</p>
                          <p className="text-white/70 text-xs">{booking.phone_number}</p>
                          <p className="text-white/70 text-xs">{booking.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/70 text-xs">{format(new Date(booking.booking_date), 'MMM dd')}</p>
                          <p className="text-white/70 text-xs">{formatTimeTo12Hour(booking.start_time)} - {formatTimeTo12Hour(booking.end_time)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>{getStatusBadge(booking.status)}</div>
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleApprove(booking.id)} disabled={actionLoading === booking.id}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white" onClick={() => handleDecline(booking.id)} disabled={actionLoading === booking.id}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(booking.id)} disabled={actionLoading === booking.id} className="text-white/90">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop / Tablet table view */}
                <table className="w-full text-sm hidden md:table">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-semibold text-white/90">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/90">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/90">Date & Time</th>
                      <th className="text-center py-3 px-4 font-semibold text-white/90">Courts</th>
                      <th className="text-center py-3 px-4 font-semibold text-white/90">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-white/90">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-700/30 hover:bg-slate-700/40 transition-colors">
                        <td className="py-4 px-4 align-top">
                          <p className="font-medium text-white">{booking.customer_name}</p>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <p className="text-white/70 text-xs">{booking.phone_number}</p>
                          <p className="text-white/70 text-xs">{booking.email}</p>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 text-white/70 text-xs">
                            <Clock className="w-3 h-3" />
                            {formatTimeTo12Hour(booking.start_time)} - {formatTimeTo12Hour(booking.end_time)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center align-top">
                          <p className="font-medium text-white">{booking.number_of_courts}</p>
                        </td>
                        <td className="py-4 px-4 text-center align-top">{getStatusBadge(booking.status)}</td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex justify-end gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                  onClick={() => handleApprove(booking.id)}
                                  disabled={actionLoading === booking.id}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-rose-500 hover:bg-rose-600 text-white"
                                  onClick={() => handleDecline(booking.id)}
                                  disabled={actionLoading === booking.id}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="text-white/90"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </Card>
        </>) }
      </main>
      </div>
    </div>
  )
}
