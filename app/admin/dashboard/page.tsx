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
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Approved
          </span>
        )
      case 'declined':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            Declined
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage court bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Back to Booking
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card className="p-6 border border-border/50 bg-yellow-50/50 dark:bg-yellow-950/20">
            <p className="text-sm text-muted-foreground mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
          </Card>
          <Card className="p-6 border border-border/50 bg-green-50/50 dark:bg-green-950/20">
            <p className="text-sm text-muted-foreground mb-2">Approved</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
          </Card>
          <Card className="p-6 border border-border/50 bg-red-50/50 dark:bg-red-950/20">
            <p className="text-sm text-muted-foreground mb-2">Declined</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.declined}</p>
          </Card>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </Button>
          <Button
            variant={activeTab === 'courts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('courts')}
          >
            Court Management
          </Button>
        </div>

        {activeTab === 'courts' ? (
          <CourtManagement />
        ) : (<>

        {actionError && (
          <div className="flex gap-3 p-4 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
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
        <Card className="border border-border/50">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Bookings</h2>
            <p className="text-sm text-muted-foreground">Showing {filteredBookings.length} of {bookings.length} bookings</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">No bookings found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Courts</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground">{booking.customer_name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-muted-foreground text-xs">{booking.phone_number}</p>
                        <p className="text-muted-foreground text-xs">{booking.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Clock className="w-3 h-3" />
                          {formatTimeTo12Hour(booking.start_time)} - {formatTimeTo12Hour(booking.end_time)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="font-medium text-foreground">{booking.number_of_courts}</p>
                      </td>
                      <td className="py-4 px-4 text-center">{getStatusBadge(booking.status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleApprove(booking.id)}
                                disabled={actionLoading === booking.id}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleDecline(booking.id)}
                                disabled={actionLoading === booking.id}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(booking.id)}
                            disabled={actionLoading === booking.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        </>) }
      </main>
    </div>
  )
}
