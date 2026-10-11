'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import type { StoreSettings } from '@/data/types'

const INITIAL: StoreSettings = {
  name: '',
  tagline: '',
  supportEmail: '',
  currency: 'USD',
  description: '',
}

export function SettingsForm() {
  const { toast } = useToast()
  const [values, setValues] = useState<StoreSettings>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const data = (await res.json()) as { settings?: StoreSettings }
        if (!cancelled && data.settings) setValues(data.settings)
      } catch {
        // Keep INITIAL; the API will seed defaults on save.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as {
        settings?: StoreSettings
        error?: string
      }
      if (!res.ok || !data.settings) {
        toast({
          title: 'Could not save',
          description: data.error ?? 'Please try again.',
          variant: 'error',
        })
        return
      }
      setValues(data.settings)
      toast({
        title: 'Settings saved',
        description: 'Your changes are now live.',
      })
    } catch {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Store profile, currency and support contact information.
          </p>
        </div>
        <Button type="submit" disabled={loading || saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </header>

      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <p className="text-sm font-semibold text-ink-900">Store profile</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Store name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            disabled={loading}
          />
          <Input
            label="Tagline"
            value={values.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            disabled={loading}
          />
          <Input
            label="Support email"
            type="email"
            value={values.supportEmail}
            onChange={(e) => update('supportEmail', e.target.value)}
            disabled={loading}
          />
          <Select
            label="Currency"
            value={values.currency}
            onChange={(e) => update('currency', e.target.value)}
            disabled={loading}
          >
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
          </Select>
          <div className="sm:col-span-2">
            <Textarea
              label="About your store"
              rows={4}
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <p className="text-sm font-semibold text-ink-900">Notifications</p>
        <div className="mt-4 grid gap-3">
          {[
            { label: 'Email me when a new order arrives', default: true },
            { label: 'Notify me when stock is running low', default: true },
            { label: 'Weekly sales summary email', default: false },
          ].map((row) => (
            <label
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50/40 px-4 py-3 text-sm text-ink-800"
            >
              <span>{row.label}</span>
              <input
                type="checkbox"
                defaultChecked={row.default}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>
      </section>
    </form>
  )
}
