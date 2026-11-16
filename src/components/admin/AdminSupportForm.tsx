'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import {
  IconClock,
  IconEye,
  IconHeadphones,
  IconMail,
  IconPhone,
  IconRefresh,
  IconTruck,
} from '@/components/icons'
import { cn } from '@/lib/cn'
import type { ContactPageData, PolicyPageData } from '@/data/types'

type SupportTab = 'shipping' | 'returns' | 'contact'

const INITIAL_POLICY: PolicyPageData = {
  title: '',
  lede: '',
  content: '',
}

const INITIAL_CONTACT: ContactPageData = {
  title: '',
  lede: '',
  content: '',
  email: '',
  phone: '',
  hours: '',
}

export function AdminSupportForm({ defaultTab = 'shipping' }: { defaultTab?: SupportTab }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<SupportTab>(defaultTab)

  const [shipping, setShipping] = useState<PolicyPageData>(INITIAL_POLICY)
  const [returns, setReturns] = useState<PolicyPageData>(INITIAL_POLICY)
  const [contact, setContact] = useState<ContactPageData>(INITIAL_CONTACT)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [shipRes, retRes, conRes] = await Promise.all([
          fetch('/api/content/shipping', { cache: 'no-store' }),
          fetch('/api/content/returns', { cache: 'no-store' }),
          fetch('/api/content/contact', { cache: 'no-store' }),
        ])
        const shipJson = (await shipRes.json()) as { data?: PolicyPageData }
        const retJson = (await retRes.json()) as { data?: PolicyPageData }
        const conJson = (await conRes.json()) as { data?: ContactPageData }

        if (!cancelled) {
          if (shipJson.data) setShipping(shipJson.data)
          if (retJson.data) setReturns(retJson.data)
          if (conJson.data) setContact(conJson.data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let endpoint = '/api/content/shipping'
    let payload: any = shipping
    let pageLabel = 'Shipping policy'

    if (activeTab === 'returns') {
      endpoint = '/api/content/returns'
      payload = returns
      pageLabel = 'Returns policy'
    } else if (activeTab === 'contact') {
      endpoint = '/api/content/contact'
      payload = contact
      pageLabel = 'Contact & Order Help'
    }

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.data) {
        toast({
          title: 'Could not save',
          description: json.error ?? 'Please check your inputs and try again.',
          variant: 'error',
        })
        return
      }

      if (activeTab === 'shipping') setShipping(json.data)
      else if (activeTab === 'returns') setReturns(json.data)
      else setContact(json.data)

      toast({
        title: `${pageLabel} saved`,
        description: `Your changes are live on the ${pageLabel} page.`,
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

  const viewUrl =
    activeTab === 'shipping'
      ? '/shipping'
      : activeTab === 'returns'
      ? '/returns'
      : '/contact'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Support Pages
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage your Shipping, Returns, and Contact / Order Help support pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={viewUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm hover:bg-ink-50"
          >
            <IconEye width={16} height={16} />
            <span>
              View {activeTab === 'shipping' ? 'Shipping' : activeTab === 'returns' ? 'Returns' : 'Order Help'}
            </span>
          </Link>
          <Button type="submit" disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-ink-200">
        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'shipping'
              ? 'border-brand-600 text-brand-600 font-semibold'
              : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700',
          )}
        >
          <IconTruck width={18} height={18} />
          <span>Shipping Policy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'returns'
              ? 'border-brand-600 text-brand-600 font-semibold'
              : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700',
          )}
        >
          <IconRefresh width={18} height={18} />
          <span>Returns &amp; Refunds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'contact'
              ? 'border-brand-600 text-brand-600 font-semibold'
              : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-700',
          )}
        >
          <IconHeadphones width={18} height={18} />
          <span>Contact &amp; Order Help</span>
        </button>
      </div>

      {/* Tab 1: Shipping */}
      {activeTab === 'shipping' && (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-ink-900">Shipping Policy</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Details on delivery times, international shipping, tracking, and carrier partners.
            </p>
          </div>
          <div className="grid gap-4">
            <Input
              label="Page title"
              value={shipping.title}
              onChange={(e) => setShipping((v) => ({ ...v, title: e.target.value }))}
              placeholder="Shipping"
              disabled={loading}
              required
            />
            <Input
              label="Lede / Short description"
              value={shipping.lede}
              onChange={(e) => setShipping((v) => ({ ...v, lede: e.target.value }))}
              placeholder="We ship worldwide from a single studio, with tracking on every order."
              disabled={loading}
            />
            <Textarea
              label="Shipping terms &amp; guidelines"
              rows={8}
              value={shipping.content}
              onChange={(e) => setShipping((v) => ({ ...v, content: e.target.value }))}
              placeholder="Enter shipping details. Separate paragraphs with an empty line."
              hint="Paragraphs separated by an empty line will be styled automatically on the live page."
              disabled={loading}
            />
          </div>
        </section>
      )}

      {/* Tab 2: Returns */}
      {activeTab === 'returns' && (
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-ink-900">Returns &amp; Refund Policy</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Specify return windows, refund procedures, and product condition criteria.
            </p>
          </div>
          <div className="grid gap-4">
            <Input
              label="Page title"
              value={returns.title}
              onChange={(e) => setReturns((v) => ({ ...v, title: e.target.value }))}
              placeholder="Returns"
              disabled={loading}
              required
            />
            <Input
              label="Lede / Short description"
              value={returns.lede}
              onChange={(e) => setReturns((v) => ({ ...v, lede: e.target.value }))}
              placeholder="If it isn’t right, send it back within 30 days."
              disabled={loading}
            />
            <Textarea
              label="Return policy content"
              rows={8}
              value={returns.content}
              onChange={(e) => setReturns((v) => ({ ...v, content: e.target.value }))}
              placeholder="Enter return instructions. Separate paragraphs with an empty line."
              hint="Paragraphs separated by an empty line will be styled automatically on the live page."
              disabled={loading}
            />
          </div>
        </section>
      )}

      {/* Tab 3: Contact & Order Help */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-ink-900">Page Content &amp; Guidance</h2>
              <p className="mt-0.5 text-xs text-ink-500">
                Inform customers how they can reach support and what details to provide.
              </p>
            </div>
            <div className="grid gap-4">
              <Input
                label="Page title"
                value={contact.title}
                onChange={(e) => setContact((v) => ({ ...v, title: e.target.value }))}
                placeholder="Contact & Order Help"
                disabled={loading}
                required
              />
              <Input
                label="Lede / Short description"
                value={contact.lede}
                onChange={(e) => setContact((v) => ({ ...v, lede: e.target.value }))}
                placeholder="Questions about an order, a formula, or shipping? We are here."
                disabled={loading}
              />
              <Textarea
                label="Help message &amp; instructions"
                rows={6}
                value={contact.content}
                onChange={(e) => setContact((v) => ({ ...v, content: e.target.value }))}
                placeholder="Provide instructions for order inquiries. Separate paragraphs with an empty line."
                hint="Paragraphs separated by an empty line will be styled automatically on the live page."
                disabled={loading}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-ink-900">Support Channels &amp; Hours</h2>
              <p className="mt-0.5 text-xs text-ink-500">
                Direct contact methods displayed on the Contact / Order Help page.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Support Email"
                type="email"
                value={contact.email}
                onChange={(e) => setContact((v) => ({ ...v, email: e.target.value }))}
                placeholder="hello@ara.store"
                leadingIcon={<IconMail width={16} height={16} />}
                disabled={loading}
              />
              <Input
                label="Support Phone / Helpline"
                type="text"
                value={contact.phone}
                onChange={(e) => setContact((v) => ({ ...v, phone: e.target.value }))}
                placeholder="+1 (555) 019-2834"
                leadingIcon={<IconPhone width={16} height={16} />}
                disabled={loading}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Working Hours / Response Time"
                  type="text"
                  value={contact.hours}
                  onChange={(e) => setContact((v) => ({ ...v, hours: e.target.value }))}
                  placeholder="e.g. Monday – Friday, 9:00 AM – 6:00 PM EST (Replies within 24 hours)"
                  leadingIcon={<IconClock width={16} height={16} />}
                  disabled={loading}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </form>
  )
}

