'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.message || 'Invalid password. Please try again.')
      }
    } catch {
      setError('Unable to sign in right now. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Wijaya Sports Club</p>
        </div>

        <Card className="p-8 border border-border/50 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
                Admin Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                required
                className="bg-background border-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/admin/reset" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Forgot password?
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Back to Booking
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
