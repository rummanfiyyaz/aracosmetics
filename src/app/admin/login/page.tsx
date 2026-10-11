'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { IconLogo } from '@/components/icons'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/admin'
  const configError = params.get('error') === 'config'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [storeName, setStoreName] = useState('Admin')
  const [error, setError] = useState<string | null>(
    configError
      ? 'Server auth is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.'
      : null,
  )

  useEffect(() => {
    let cancelled = false
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.settings?.name) setStoreName(data.settings.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Sign in failed')
        setSubmitting(false)
        return
      }
      router.replace(redirect)
      router.refresh()
    } catch {
      setError('Network error — try again')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-white">
          <IconLogo width={20} height={20} />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink-900">{storeName} Admin</p>
          <p className="text-xs text-ink-500">Sign in to manage your store</p>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-800">
          ← Back to storefront
        </Link>
      </p>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
