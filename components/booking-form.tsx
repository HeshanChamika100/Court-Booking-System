'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, Users, Loader2, CalendarDays, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

type SlotData = {
  start_time: string
  end_time: string
  total_courts: number
  booked_courts: number
  available_courts: number
}

type SelectedRange = { start: number; end: number }

function formatTime(t: string) {
  const [h] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${dh}:00 ${period}`
}

function getSlotStyle(available: number, total: number, isSelected: boolean, isAdjacent: boolean) {
  if (isSelected) return {
    container: 'bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]',
    badge: 'bg-white/20 text-white',
    label: `${available} Court${available !== 1 ? 's' : ''} Available`,
    dot: 'bg-white',
    topLabel: '✓ selected',
  }
  if (available === 0) return {
    container: 'bg-muted/40 border-border/30 opacity-55 cursor-not-allowed',
    badge: 'bg-muted text-muted-foreground',
    label: 'Full',
    dot: 'bg-muted-foreground',
    topLabel: '1 hr slot',
  }
  const adjacentRing = isAdjacent ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background' : ''
  const ratio = available / total
  if (ratio > 0.66) return {
    container: `bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:scale-[1.02] cursor-pointer ${adjacentRing}`,
    badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    label: `${available} Court${available !== 1 ? 's' : ''} Available`,
    dot: 'bg-emerald-500',
    topLabel: isAdjacent ? '+ extend' : '1 hr slot',
  }
  if (ratio > 0.33) return {
    container: `bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-500/60 hover:scale-[1.02] cursor-pointer ${adjacentRing}`,
    badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    label: `${available} Court${available !== 1 ? 's' : ''} Available`,
    dot: 'bg-amber-500',
    topLabel: isAdjacent ? '+ extend' : '1 hr slot',
  }
  return {
    container: `bg-red-500/10 border-red-500/40 hover:bg-red-500/20 hover:border-red-500/60 hover:scale-[1.02] cursor-pointer ${adjacentRing}`,
    badge: 'bg-red-500/20 text-red-600 dark:text-red-400',
    label: `${available} Court${available !== 1 ? 's' : ''} Available`,
    dot: 'bg-red-500',
    topLabel: isAdjacent ? '+ extend' : '1 hr slot',
  }
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [{ n: 1, label: 'Date' }, { n: 2, label: 'Time Slot' }, { n: 3, label: 'Details' }]
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${current > s.n ? 'bg-primary text-primary-foreground' :
                current === s.n ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                  'bg-muted text-muted-foreground'
              }`}>{current > s.n ? '✓' : s.n}</div>
            <span className={`text-xs font-medium ${current >= s.n ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${current > s.n ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export function BookingForm() {
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<SlotData[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null)
  const [numberOfCourts, setNumberOfCourts] = useState(1)
  const [formData, setFormData] = useState({ customer_name: '', phone_number: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isClosed, setIsClosed] = useState(false)
  const [closedNote, setClosedNote] = useState<string | null>(null)

  // Derived
  const selectedSlots = selectedRange !== null ? slots.slice(selectedRange.start, selectedRange.end + 1) : []
  const availableCourtsForRange = selectedSlots.length > 0 ? Math.min(...selectedSlots.map(s => s.available_courts)) : 0
  const durationHours = selectedRange !== null ? selectedRange.end - selectedRange.start + 1 : 0
  const step: 1 | 2 | 3 = !selectedDate ? 1 : selectedRange === null ? 2 : 3

  const fetchSlots = useCallback(async (date: string) => {
    setSlotsLoading(true)
    setError('')
    setSlots([])
    setSelectedRange(null)
    setIsClosed(false)
    setClosedNote(null)
    try {
      const res = await fetch(`/api/bookings/slots?date=${date}`)
      const data = await res.json()
      if (data.success) {
        if (data.closed) {
          setIsClosed(true)
          setClosedNote(data.note ?? null)
        } else {
          setSlots(data.data)
        }
      } else {
        setError('Could not load availability. Please try again.')
      }
    } catch {
      setError('Could not load availability. Please try again.')
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    setSelectedRange(null)
    setIsClosed(false)
    setClosedNote(null)
    setError('')
    if (date) fetchSlots(date)
  }

  const handleSlotClick = (i: number) => {
    const slot = slots[i]
    if (slot.available_courts === 0) return

    if (selectedRange === null) {
      setSelectedRange({ start: i, end: i })
      setNumberOfCourts(1)
      setError('')
      return
    }

    const { start, end } = selectedRange

    // Click within selection → smart trim from edges, or clear if middle
    if (i >= start && i <= end) {
      if (i === start && i === end) {
        // Only one slot selected → clear entirely
        setSelectedRange(null)
      } else if (i === start) {
        // Remove the first slot from the range
        const newMin = Math.min(...slots.slice(start + 1, end + 1).map(s => s.available_courts))
        setSelectedRange({ start: start + 1, end })
        setNumberOfCourts(prev => Math.min(prev, newMin))
      } else if (i === end) {
        // Remove the last slot from the range
        const newMin = Math.min(...slots.slice(start, end).map(s => s.available_courts))
        setSelectedRange({ start, end: end - 1 })
        setNumberOfCourts(prev => Math.min(prev, newMin))
      } else {
        // Middle slot clicked - can't split a range, clear all
        setSelectedRange(null)
      }
      setError('')
      return
    }

    // Extend start (click immediately before range)
    if (i === start - 1) {
      const newMin = Math.min(...slots.slice(i, end + 1).map(s => s.available_courts))
      setSelectedRange({ start: i, end })
      setNumberOfCourts(prev => Math.min(prev, newMin))
      setError('')
      return
    }

    // Extend end (click immediately after range)
    if (i === end + 1) {
      const newMin = Math.min(...slots.slice(start, i + 1).map(s => s.available_courts))
      setSelectedRange({ start, end: i })
      setNumberOfCourts(prev => Math.min(prev, newMin))
      setError('')
      return
    }

    // Non-adjacent → start fresh
    setSelectedRange({ start: i, end: i })
    setNumberOfCourts(1)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRange || !selectedDate || slots.length === 0) return
    setError('')
    setSubmitting(true)

    // Re-fetch current availability before submitting - catch stale data early
    try {
      const freshRes = await fetch(`/api/bookings/slots?date=${selectedDate}`)
      const freshData = await freshRes.json()

      if (freshData.success) {
        const freshSlots: SlotData[] = freshData.data
        setSlots(freshSlots)

        const freshSelected = freshSlots.slice(selectedRange.start, selectedRange.end + 1)
        const freshMin = Math.min(...freshSelected.map((s) => s.available_courts))

        if (freshMin === 0) {
          setError('This slot is now fully booked. Please select a different time slot.')
          setSelectedRange(null)
          setSubmitting(false)
          return
        }

        if (freshMin < numberOfCourts) {
          setError(
            `Availability changed - only ${freshMin} court${freshMin !== 1 ? 's' : ''} remaining for this slot. Please reduce your selection.`
          )
          setNumberOfCourts(freshMin)
          setSubmitting(false)
          return
        }
      }
    } catch {
      // If refresh fails, fall through - POST will validate server-side
    }

    const startSlot = slots[selectedRange.start]
    const endSlot = slots[selectedRange.end]

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          phone_number: formData.phone_number,
          email: formData.email,
          booking_date: selectedDate,
          start_time: startSlot.start_time,
          end_time: endSlot.end_time,
          number_of_courts: numberOfCourts,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create booking')

      setSuccess(true)
      setSelectedDate(''); setSlots([]); setSelectedRange(null); setNumberOfCourts(1)
      setFormData({ customer_name: '', phone_number: '', email: '' })
      setTimeout(() => setSuccess(false), 8000)
    } catch (err) {
      console.error('[v0] Error creating booking:', err)
      setError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border border-white/20 bg-white/92 p-6 shadow-2xl shadow-black/20 ring-1 ring-white/30 backdrop-blur-2xl md:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Book Your Court</h2>
          <p className="mt-1 text-sm text-slate-600">Wijaya Sports Club · 4:00 PM – 10:00 PM daily</p>
        </div>

        <StepIndicator current={step} />

        {success && (
          <div className="mb-6 flex gap-3 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-600 font-semibold">Booking Request Submitted!</p>
              <p className="text-emerald-600/80 text-sm mt-0.5">We'll review your request and send a confirmation email shortly.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Step 1 - Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Step 1 - Select a Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={today}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {selectedDate && (
              <p className="mt-1.5 text-xs text-muted-foreground pl-1">
                {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM dd, yyyy')}
              </p>
            )}
          </div>

          {/* Step 2 - Slot grid */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  Step 2 - Pick Time Slot(s)
                </label>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Plenty</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Limited</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Almost full</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3 pl-1">
                Click a slot to select it. Click an adjacent slot to extend your session.
              </p>

              {/* Duration pill */}
              {selectedRange !== null && (
                <div className="mb-3 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-xs font-medium text-primary flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {durationHours} hr{durationHours > 1 ? 's' : ''}{' '} selected
                    &nbsp;·&nbsp;
                    {formatTime(slots[selectedRange.start].start_time)} – {formatTime(slots[selectedRange.end].end_time)}
                  </span>
                  <button type="button" onClick={() => setSelectedRange(null)} className="ml-auto text-primary/60 hover:text-primary underline text-xs">
                    Clear
                  </button>
                </div>
              )}

              {isClosed ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 bg-red-500/8 border border-red-500/30 rounded-xl">
                  <span className="text-3xl">🚫</span>
                  <p className="font-semibold text-foreground">No bookings on this date</p>
                  {closedNote && <p className="text-sm text-muted-foreground">{closedNote}</p>}
                </div>
              ) : slotsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 bg-muted/20 rounded-xl border border-border/40">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Checking availability…</p>
                </div>
              ) : (

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map((slot, i) => {
                    const isSelected = selectedRange !== null && i >= selectedRange.start && i <= selectedRange.end
                    const isAdjacent = selectedRange !== null &&
                      (i === selectedRange.start - 1 || i === selectedRange.end + 1) &&
                      slot.available_courts > 0
                    const style = getSlotStyle(slot.available_courts, slot.total_courts, isSelected, isAdjacent)
                    return (
                      <button
                        key={slot.start_time}
                        type="button"
                        disabled={slot.available_courts === 0}
                        onClick={() => handleSlotClick(i)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left select-none ${style.container} ${isSelected ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {style.topLabel}
                          </span>
                        </div>
                        <p className={`text-sm font-bold leading-tight mb-2 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                          {formatTime(slot.start_time)}
                          <span className="font-normal text-xs block">to {formatTime(slot.end_time)}</span>
                        </p>
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                          {slot.available_courts === 0 ? 'Full' : style.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3 - Court count + personal details */}
          {selectedRange !== null && slots.length > 0 && (
            <div className="space-y-5 pt-2 border-t border-border/50">
              {/* Selection summary strip */}
              <div className="flex items-center gap-3 p-3 bg-primary/8 border border-primary/20 rounded-lg">
                <div className="w-9 h-9 bg-primary/15 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {formatTime(slots[selectedRange.start].start_time)} – {formatTime(slots[selectedRange.end].end_time)}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">({durationHours} hr{durationHours > 1 ? 's' : ''})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM dd, yyyy')}
                  </p>
                </div>
                <button type="button" onClick={() => { setSelectedRange(null); setError('') }} className="text-xs text-primary hover:underline shrink-0">
                  Change
                </button>
              </div>

              {/* Court count picker */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  Step 3a - How many courts?
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  {availableCourtsForRange} court{availableCourtsForRange !== 1 ? 's' : ''} available across your selected time
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: availableCourtsForRange }, (_, k) => k + 1).map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNumberOfCourts(n)}
                      className={`w-12 h-12 rounded-xl border-2 font-bold text-sm transition-all duration-150 ${numberOfCourts === n
                          ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
                          : 'border-border hover:border-primary/50 text-foreground hover:scale-105'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal details form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  Step 3b - Your Details
                </p>

                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium mb-1.5 text-foreground">Full Name *</label>
                  <Input
                    id="customer_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.customer_name}
                    onChange={e => setFormData(p => ({ ...p, customer_name: e.target.value }))}
                    required
                    className="bg-background border-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="booking_email" className="block text-sm font-medium mb-1.5 text-foreground">Email *</label>
                    <Input
                      id="booking_email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      required
                      className="bg-background border-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking_phone" className="block text-sm font-medium mb-1.5 text-foreground">Phone *</label>
                    <Input
                      id="booking_phone"
                      type="tel"
                      placeholder="+94 XX XXX XXXX"
                      value={formData.phone_number}
                      onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                      required
                      className="bg-background border-input"
                    />
                  </div>
                </div>

                {/* Booking summary */}
                <div className="p-4 bg-muted/40 border border-border/50 rounded-xl text-sm space-y-1.5">
                  <p className="font-semibold text-foreground mb-2">📋 Booking Summary</p>
                  <p className="text-muted-foreground">📅 {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM dd, yyyy')}</p>
                  <p className="text-muted-foreground">🕐 {formatTime(slots[selectedRange.start].start_time)} – {formatTime(slots[selectedRange.end].end_time)} ({durationHours} hr{durationHours > 1 ? 's' : ''})</p>
                  <p className="text-muted-foreground">🏸 {numberOfCourts} Court{numberOfCourts !== 1 ? 's' : ''}</p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-base"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting…</> : 'Request Booking'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
