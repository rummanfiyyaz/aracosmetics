'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { IconEye, IconFileText, IconShield } from '@/components/icons'
import { cn } from '@/lib/cn'
import type { PolicyPageData } from '@/data/types'

type PolicyTab = 'privacy' | 'terms'

const INITIAL: PolicyPageData = {
  title: '',
  lede: '',
  content: '',
}

export function AdminPoliciesForm({ defaultTab = 'privacy' }: { defaultTab?: PolicyTab }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<PolicyTab>(defaultTab)

  const [privacy, setPrivacy] = useState<PolicyPageData>(INITIAL)
  const [terms, setTerms] = useState<PolicyPageData>(INITIAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [privRes, termsRes] = await Promise.all([
          fetch('/api/content/privacy', { cache: 'no-store' }),
          fetch('/api/content/terms', { cache: 'no-store' }),
        ])
        const privJson = (await privRes.json()) as { data?: PolicyPageData }
        const termsJson = (await termsRes.json()) as { data?: PolicyPageData }

        if (!cancelled) {
          if (privJson.data) setPrivacy(privJson.data)
          if (termsJson.data) setTerms(termsJson.data)
        }
      } catch {
        // Fall back to defaults
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const currentValues = activeTab === 'privacy' ? privacy : terms
  const updateCurrent = <K extends keyof PolicyPageData>(key: K, value: PolicyPageData[K]) => {
    if (activeTab === 'privacy') {
      setPrivacy((v) => ({ ...v, [key]: value }))
    } else {
      setTerms((v) => ({ ...v, [key]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const endpoint = activeTab === 'privacy' ? '/api/content/privacy' : '/api/content/terms'
    const payload = activeTab === 'privacy' ? privacy : terms
    const pageName = activeTab === 'privacy' ? 'Privacy policy' : 'Terms of service'

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await res.json()) as {
        data?: PolicyPageData
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

      if (activeTab === 'privacy') {
        setPrivacy(json.data)
      } else {
        setTerms(json.data)
      }

      toast({
        title: `${pageName} saved`,
        description: `Your changes are now live on the ${pageName} page.`,
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

  const viewUrl = activeTab === 'privacy' ? '/privacy' : '/terms'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Policies & Legal
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your store&apos;s Privacy Policy and Terms of Service.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={viewUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <IconEye width={16} height={16} />
            <span>View {activeTab === 'privacy' ? 'Privacy' : 'Terms'}</span>
          </Link>
          <Button type="submit" disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-ink-200">
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'privacy'
              ? 'border-brand-600 text-brand-600 font-semibold'
              : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700',
          )}
        >
          <IconShield width={18} height={18} />
          <span>Privacy Policy</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'terms'
              ? 'border-brand-600 text-brand-600 font-semibold'
              : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700',
          )}
        >
          <IconFileText width={18} height={18} />
          <span>Terms of Service</span>
        </button>
      </div>

      {/* Policy Content Form */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-ink-900">
            {activeTab === 'privacy' ? 'Privacy Policy Content' : 'Terms of Service Content'}
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {activeTab === 'privacy'
              ? 'Explain how customer data and privacy are handled.'
              : 'Specify conditions, payment terms, and delivery responsibilities.'}
          </p>
        </div>

        <div className="grid gap-4">
          <Input
            label="Page title"
            value={currentValues.title}
            onChange={(e) => updateCurrent('title', e.target.value)}
            placeholder={activeTab === 'privacy' ? 'Privacy policy' : 'Terms of service'}
            disabled={loading}
            required
          />

          <Input
            label="Lede / Short summary"
            value={currentValues.lede}
            onChange={(e) => updateCurrent('lede', e.target.value)}
            placeholder={
              activeTab === 'privacy'
                ? 'We collect only what we need to fulfill your order.'
                : 'By placing an order you agree to these terms.'
            }
            disabled={loading}
          />

          <Textarea
            label="Policy content"
            rows={10}
            value={currentValues.content}
            onChange={(e) => updateCurrent('content', e.target.value)}
            placeholder="Enter policy terms. Separate paragraphs with an empty line."
            hint="Paragraphs separated by an empty line will be styled automatically on the page."
            disabled={loading}
          />
        </div>
      </section>
    </form>
  )
}

