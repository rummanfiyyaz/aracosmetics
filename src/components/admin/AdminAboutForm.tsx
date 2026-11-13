'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { IconEye, IconMail, IconMapPin, IconPhone } from '@/components/icons'
import type { AboutPageData } from '@/data/types'

const INITIAL: AboutPageData = {
  title: '',
  lede: '',
  story: '',
  address: '',
  email: '',
  phone: '',
}

export function AdminAboutForm() {
  const { toast } = useToast()
  const [values, setValues] = useState<AboutPageData>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/content/about', { cache: 'no-store' })
        const json = (await res.json()) as { data?: AboutPageData }
        if (!cancelled && json.data) {
          setValues(json.data)
        }
      } catch {
        // Fall back to INITIAL
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const update = <K extends keyof AboutPageData>(key: K, value: AboutPageData[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = (await res.json()) as {
        data?: AboutPageData
        error?: string
      }
      if (!res.ok || !json.data) {
        toast({
          title: 'Could not save',
          description: json.error ?? 'Please check your inputs and try again.',
          variant: 'error',
        })
        return
      }
      setValues(json.data)
      toast({
        title: 'About Us updated',
        description: 'Your changes are live on the About Us page.',
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
            About Us
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your brand story and contact details (address, email, contact number).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <IconEye width={16} height={16} />
            <span>View page</span>
          </Link>
          <Button type="submit" disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </header>

      {/* Brand & Story Section */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-semibold text-ink-900">Brand Story & Introduction</h2>
        <p className="mt-0.5 text-xs text-ink-500">
          This content appears prominently on the main About Us page.
        </p>

        <div className="mt-4 grid gap-4">
          <Input
            label="Page title"
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. About ARA"
            disabled={loading}
            required
          />

          <Input
            label="Tagline / Short description"
            value={values.lede}
            onChange={(e) => update('lede', e.target.value)}
            placeholder="e.g. A quiet cosmetics house for everyday skin, color and scent."
            disabled={loading}
          />

          <Textarea
            label="Story / Detailed description"
            rows={6}
            value={values.story}
            onChange={(e) => update('story', e.target.value)}
            placeholder="Tell your customers about your brand, values, and products. Separate paragraphs with double line breaks."
            hint="Paragraphs separated by empty lines will be rendered as separate sections."
            disabled={loading}
          />
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-semibold text-ink-900">Contact Information</h2>
        <p className="mt-0.5 text-xs text-ink-500">
          Customers will see these contact details on the About Us page.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Store Address"
              value={values.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="e.g. 123 Fashion Ave, Suite 400, New York, NY 10001"
              leadingIcon={<IconMapPin width={16} height={16} />}
              disabled={loading}
            />
          </div>

          <Input
            label="Contact Email"
            type="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="e.g. contact@arastore.com"
            leadingIcon={<IconMail width={16} height={16} />}
            disabled={loading}
          />

          <Input
            label="Contact Number / Phone"
            type="text"
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="e.g. +1 (555) 019-2834"
            leadingIcon={<IconPhone width={16} height={16} />}
            disabled={loading}
          />
        </div>
      </section>
    </form>
  )
}

