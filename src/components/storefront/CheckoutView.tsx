'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/format'
import { calcOrderTotals, FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'
import { COUNTRIES } from '@/data/countries'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { IconChevronRight, IconShield, IconTruck } from '@/components/icons'
import { CheckoutPayment } from './CheckoutPayment'

interface FormState {
  customer: string
  email: string
  phone: string
  line1: string
  line2: string
  city: string
  region: string
  postalCode: string
  country: string
  notes: string
}

const initialState: FormState = {
  customer: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'United States',
  notes: '',
}

export function CheckoutView() {
  const { items, subtotal, count } = useCart()
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [preparing, setPreparing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const { toast } = useToast()

  const { shipping, tax, total } = useMemo(
    () => calcOrderTotals(subtotal),
    [subtotal],
  )

  if (items.length === 0 && !clientSecret) {
    return (
      <section className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card">
          <p className="text-lg font-semibold text-ink-900">
            Your cart is empty
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Add something to your cart before checking out.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button size="lg">Continue shopping</Button>
          </Link>
        </div>
      </section>
    )
  }

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.customer.trim()) e.customer = 'Enter your full name'
    if (!form.email.trim()) e.email = 'Enter your email'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = 'Enter a valid email address'
    if (!form.line1.trim()) e.line1 = 'Enter your street address'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.region.trim()) e.region = 'State / region is required'
    if (!form.postalCode.trim()) e.postalCode = 'Postal / ZIP code is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onContinue = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      toast({ title: 'Please fix the errors above', variant: 'error' })
      return
    }
    setPreparing(true)

    try {
      const res = await fetch('/api/checkout/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form.customer,
          email: form.email,
          phone: form.phone || undefined,
          notes: form.notes || undefined,
          address: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
          },
          items: items.map((item) => ({
            productId: item.productId,
            variant: item.variant,
            quantity: item.quantity,
          })),
        }),
      })
      const data = (await res.json()) as {
        clientSecret?: string
        error?: string
      }
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Unable to start payment.')
      }
      setClientSecret(data.clientSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      toast({ title: 'Checkout failed', description: message, variant: 'error' })
    } finally {
      setPreparing(false)
    }
  }

  const locked = Boolean(clientSecret)

  return (
    <section className="container-page py-8 lg:py-12">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-ink-500">
          <Link href="/" className="hover:text-ink-800">
            Home
          </Link>
          <IconChevronRight width={12} height={12} />
          <Link href="/cart" className="hover:text-ink-800">
            Cart
          </Link>
          <IconChevronRight width={12} height={12} />
          <span className="text-ink-800">Checkout</span>
        </nav>
        <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {count} item{count > 1 ? 's' : ''} · Pay securely on this page
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={onContinue} className="space-y-6">
            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
              <p className="text-sm font-semibold text-ink-900">
                Contact information
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  placeholder="Jane Doe"
                  value={form.customer}
                  onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                  error={errors.customer}
                  disabled={locked}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                  disabled={locked}
                />
                <Input
                  label="Phone (optional)"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  disabled={locked}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
              <p className="text-sm font-semibold text-ink-900">
                Shipping address
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Street address"
                    placeholder="123 Main St"
                    value={form.line1}
                    onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                    error={errors.line1}
                    disabled={locked}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Apartment / suite (optional)"
                    value={form.line2}
                    onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                    disabled={locked}
                  />
                </div>
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  error={errors.city}
                  disabled={locked}
                />
                <Input
                  label="State / region"
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  error={errors.region}
                  disabled={locked}
                />
                <Input
                  label="Postal / ZIP code"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, postalCode: e.target.value }))
                  }
                  error={errors.postalCode}
                  disabled={locked}
                />
                <Select
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  disabled={locked}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </div>
            </section>

            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
              <p className="text-sm font-semibold text-ink-900">Order notes</p>
              <Textarea
                rows={3}
                placeholder="Gift note or delivery instructions (optional)"
                className="mt-3"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                disabled={locked}
              />
            </section>

            {!locked && (
              <Button type="submit" size="lg" disabled={preparing}>
                {preparing ? 'Preparing payment…' : 'Continue to payment'}
              </Button>
            )}
          </form>

          <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">Payment</p>
            {locked && clientSecret ? (
              <div className="mt-4">
                <CheckoutPayment
                  clientSecret={clientSecret}
                  amount={total}
                  customer={form.customer}
                  email={form.email}
                  phone={form.phone || undefined}
                  address={{
                    line1: form.line1,
                    line2: form.line2 || undefined,
                    city: form.city,
                    region: form.region,
                    postalCode: form.postalCode,
                    country: form.country,
                  }}
                />
                <button
                  type="button"
                  className="mt-4 text-sm text-ink-500 underline-offset-2 hover:text-ink-800 hover:underline"
                  onClick={() => setClientSecret(null)}
                >
                  Edit shipping details
                </button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-ink-500">
                Enter your details, then pay here with card. Your card never
                touches our servers.
              </p>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-base font-semibold text-ink-900">Your order</p>
            <ul className="mt-4 divide-y divide-ink-100">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink-900 px-1 text-[10px] font-semibold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-ink-900">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-ink-500">{item.variant}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-ink-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-3 border-t border-ink-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-medium text-ink-900">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Shipping</dt>
                <dd className="font-medium text-ink-900">
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Estimated tax</dt>
                <dd className="font-medium text-ink-900">{formatPrice(tax)}</dd>
              </div>
              <div className="border-t border-ink-100 pt-3">
                <div className="flex items-center justify-between">
                  <dt className="text-base font-semibold text-ink-900">Total</dt>
                  <dd className="text-lg font-semibold text-ink-900">
                    {formatPrice(total)}
                  </dd>
                </div>
              </div>
            </dl>
            <ul className="mt-5 space-y-2 text-xs text-ink-500">
              <li className="flex items-center gap-2">
                <IconTruck width={14} height={14} />
                Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </li>
              <li className="flex items-center gap-2">
                <IconShield width={14} height={14} />
                Encrypted card payment on this page
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
