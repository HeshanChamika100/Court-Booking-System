'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Plus, Trash2, AlertCircle, CheckCircle, Loader2,
  ToggleLeft, ToggleRight, CalendarOff, Clock4,
  Pencil, X as XIcon, Check as CheckIcon,
} from 'lucide-react'
import { type Court, type DateOverride } from '@/lib/supabase'
import { formatTimeTo12Hour } from '@/lib/utils'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex gap-3 mb-5">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Existing Bookings Affected</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onConfirm}
          >
            Proceed Anyway
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Courts Section ───────────────────────────────────────────────────────────

function CourtsSection() {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Court | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/courts')
    const data = await res.json()
    if (data.success) setCourts(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    const res = await fetch('/api/admin/courts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setCourts((prev) => [...prev, data.data])
      setNewName('')
    } else {
      setError(data.message)
    }
    setAdding(false)
  }

  const handleToggle = async (court: Court) => {
    setTogglingId(court.id)
    const res = await fetch(`/api/admin/courts/${court.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !court.is_active }),
    })
    const data = await res.json()
    if (data.success) setCourts((prev) => prev.map((c) => (c.id === court.id ? data.data : c)))
    setTogglingId(null)
  }

  const startEdit = (court: Court) => {
    setEditingId(court.id)
    setEditName(court.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleRename = async (id: number) => {
    if (!editName.trim()) return
    setRenamingId(id)
    const res = await fetch(`/api/admin/courts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setCourts((prev) => prev.map((c) => (c.id === id ? data.data : c)))
      setEditingId(null)
    } else {
      setError(data.message)
    }
    setRenamingId(null)
  }

  const handleDelete = async (court: Court) => {
    setDeleteConfirm(null)
    setDeletingId(court.id)
    const res = await fetch(`/api/admin/courts/${court.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) setCourts((prev) => prev.filter((c) => c.id !== court.id))
    else setError(data.message)
    setDeletingId(null)
  }

  const active = courts.filter((c) => c.is_active).length

  return (
    <>
      {deleteConfirm && (
        <ConfirmModal
          message={`Delete "${deleteConfirm.name}" permanently? This cannot be undone.`}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <Card className="p-6 border border-border/50">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground text-lg">Courts</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {active} active / {courts.length} total
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Add, rename, delete, or toggle courts active/inactive. Only active courts count toward booking capacity.
        </p>

        {error && (
          <div className="flex gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {/* Add court */}
        <div className="flex gap-2 mb-5">
          <Input
            placeholder="e.g. Court 7"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="bg-background border-input"
          />
          <Button onClick={handleAdd} disabled={adding || !newName.trim()} className="flex-shrink-0">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="ml-1.5">Add</span>
          </Button>
        </div>

        {/* Court list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {courts.map((court) => (
              <div
                key={court.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${court.is_active
                    ? 'bg-emerald-500/8 border-emerald-500/30'
                    : 'bg-muted/40 border-border/40 opacity-70'
                  }`}
              >
                {/* Status dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${court.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />

                {/* Name / edit input */}
                {editingId === court.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(court.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 px-2 py-0.5 rounded-md border border-primary/60 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0"
                  />
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground truncate">{court.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${court.is_active ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'
                      }`}>
                      {court.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {editingId === court.id ? (
                    <>
                      {/* Confirm rename */}
                      <button
                        onClick={() => handleRename(court.id)}
                        disabled={renamingId === court.id || !editName.trim()}
                        className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                        title="Save name"
                      >
                        {renamingId === court.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <CheckIcon className="w-4 h-4" />
                        }
                      </button>
                      {/* Cancel rename */}
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                        title="Cancel"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Edit name */}
                      <button
                        onClick={() => startEdit(court)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Rename court"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggle(court)}
                        disabled={togglingId === court.id}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title={court.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {togglingId === court.id
                          ? <Loader2 className="w-5 h-5 animate-spin" />
                          : court.is_active
                            ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                            : <ToggleLeft className="w-5 h-5" />
                        }
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirm(court)}
                        disabled={deletingId === court.id}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete court"
                      >
                        {deletingId === court.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {courts.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No courts found.</p>
            )}
          </div>
        )}
      </Card>
    </>
  )
}

// ─── Date Overrides Section ───────────────────────────────────────────────────

type FormState = {
  ruleType: 'date' | 'weekday'
  date: string
  dayOfWeek: number
  action: 'close' | 'custom_hours'
  openTime: string
  closeTime: string
  note: string
}

function DateOverridesSection() {
  const [overrides, setOverrides] = useState<DateOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirm, setConfirm] = useState<{ message: string; payload: object } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DateOverride | null>(null)

  const [form, setForm] = useState<FormState>({
    ruleType: 'date',
    date: '',
    dayOfWeek: 1,
    action: 'close',
    openTime: '16:00',
    closeTime: '22:00',
    note: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/date-overrides')
    const data = await res.json()
    if (data.success) setOverrides(data.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const buildPayload = (force = false) => ({
    date: form.ruleType === 'date' ? form.date : undefined,
    day_of_week: form.ruleType === 'weekday' ? form.dayOfWeek : undefined,
    is_closed: form.action === 'close',
    open_time: form.action === 'custom_hours' ? form.openTime : undefined,
    close_time: form.action === 'custom_hours' ? form.closeTime : undefined,
    note: form.note || undefined,
    force,
  })

  const submit = async (force = false) => {
    setError('')
    setSaving(true)
    const payload = buildPayload(force)

    if (form.ruleType === 'date' && !form.date) {
      setError('Please select a date.')
      setSaving(false)
      return
    }
    if (form.action === 'custom_hours' && form.openTime >= form.closeTime) {
      setError('Close time must be after open time.')
      setSaving(false)
      return
    }

    const res = await fetch('/api/admin/date-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)

    if (data.requiresConfirmation) {
      setConfirm({ message: data.message, payload: buildPayload(true) })
      return
    }

    if (data.success) {
      setOverrides((prev) => [data.data, ...prev])
      setForm({ ruleType: 'date', date: '', dayOfWeek: 1, action: 'close', openTime: '16:00', closeTime: '22:00', note: '' })
      setSuccess('Rule saved.')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(data.message || 'Failed to save rule.')
    }
  }

  const handleConfirmed = async () => {
    if (!confirm) return
    setConfirm(null)
    setSaving(true)
    const res = await fetch('/api/admin/date-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirm.payload),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setOverrides((prev) => [data.data, ...prev])
      setForm({ ruleType: 'date', date: '', dayOfWeek: 1, action: 'close', openTime: '16:00', closeTime: '22:00', note: '' })
      setSuccess('Rule saved.')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(data.message || 'Failed to save rule.')
    }
  }

  const handleDelete = async (override: DateOverride) => {
    setDeleteConfirm(null)
    setDeletingId(override.id)
    const res = await fetch(`/api/admin/date-overrides/${override.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) setOverrides((prev) => prev.filter((o) => o.id !== override.id))
    setDeletingId(null)
  }

  const describeOverride = (o: DateOverride) => {
    const target = o.date
      ? o.date
      : `Every ${DAYS[o.day_of_week!]}`
    if (o.is_closed) return `${target} - Closed`
    const open = o.open_time ?? '16:00'
    const close = o.close_time ?? '22:00'
    return `${target} - ${formatTimeTo12Hour(open)} – ${formatTimeTo12Hour(close)}`
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={handleConfirmed}
          onCancel={() => setConfirm(null)}
        />
      )}
      {deleteConfirm && (
        <ConfirmModal
          message={`Remove the rule "${describeOverride(deleteConfirm)}"? Bookings on affected dates will not be changed.`}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground text-lg mb-1">Date & Hour Overrides</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Block specific dates or recurring weekdays, or set custom operating hours.
          Specific-date rules always override weekday rules.
        </p>

        {error && (
          <div className="flex gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="flex gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {success}
          </div>
        )}

        {/* Add rule form */}
        <div className="bg-muted/30 border border-border/40 rounded-xl p-4 mb-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">Add New Rule</p>

          {/* Rule type toggle */}
          <div className="flex gap-2">
            {(['date', 'weekday'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, ruleType: t }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.ruleType === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
              >
                {t === 'date' ? 'Specific Date' : 'Recurring Weekday'}
              </button>
            ))}
          </div>

          {/* Date or weekday picker */}
          {form.ruleType === 'date' ? (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Weekday</label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {DAYS.map((day, i) => (
                  <option key={day} value={i}>{day}</option>
                ))}
              </select>
            </div>
          )}

          {/* Action toggle */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Action</label>
            <div className="flex gap-2">
              {(['close', 'custom_hours'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, action: a }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.action === a
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                >
                  {a === 'close' ? <CalendarOff className="w-3.5 h-3.5" /> : <Clock4 className="w-3.5 h-3.5" />}
                  {a === 'close' ? 'Close for the day' : 'Custom hours'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom hours inputs */}
          {form.action === 'custom_hours' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Open time</label>
                <input
                  type="time"
                  value={form.openTime}
                  step={3600}
                  onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Close time</label>
                <input
                  type="time"
                  value={form.closeTime}
                  step={3600}
                  onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Note (optional - shown to users)</label>
            <Input
              placeholder="e.g. Public holiday, maintenance..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="bg-background border-input text-sm"
            />
          </div>

          <Button onClick={() => submit()} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Save Rule
          </Button>
        </div>

        {/* Existing rules */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : overrides.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">No override rules yet.</p>
        ) : (
          <div className="space-y-2">
            {overrides.map((o) => (
              <div
                key={o.id}
                className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border ${o.is_closed
                    ? 'bg-red-500/8 border-red-500/30'
                    : 'bg-amber-500/8 border-amber-500/30'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  {o.is_closed
                    ? <CalendarOff className="w-4 h-4 text-red-500 flex-shrink-0" />
                    : <Clock4 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  }
                  <div>
                    <p className="text-sm font-medium text-foreground">{describeOverride(o)}</p>
                    {o.note && <p className="text-xs text-muted-foreground mt-0.5">{o.note}</p>}
                    {o.day_of_week !== null && (
                      <span className="text-xs text-primary font-medium">Recurring every {DAYS[o.day_of_week]}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(o)}
                  disabled={deletingId === o.id}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                >
                  {deletingId === o.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CourtManagement() {
  return (
    <div className="space-y-6">
      <CourtsSection />
      <DateOverridesSection />
    </div>
  )
}
