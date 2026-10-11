'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { formatDate, formatPrice } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { IconChevronRight, IconSearch } from '@/components/icons'
import type { Order, OrderStatus, PaymentStatus } from '@/data/types'

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

const badgeTones: Record<
  OrderStatus,
  'default' | 'success' | 'info' | 'warning' | 'danger'
> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

const paymentTones: Record<
  PaymentStatus,
  'default' | 'success' | 'info' | 'warning' | 'danger'
> = {
  unpaid: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'info',
}

function paymentOf(order: Order): PaymentStatus {
  return order.paymentStatus ?? 'unpaid'
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (
        q &&
        !o.customer.toLowerCase().includes(q) &&
        !o.email.toLowerCase().includes(q) &&
        !o.id.toLowerCase().includes(q)
      )
        return false
      if (status !== 'all' && o.status !== status) return false
      return true
    })
  }, [orders, query, status])

  const opened = orders.find((o) => o.id === openId)

  const updateStatus = async (id: string, nextStatus: OrderStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast({
        title: 'Order updated',
        description: `${id} → ${nextStatus}`,
      })
      router.refresh()
    } catch {
      toast({ title: "Couldn't update order", variant: 'error' })
    } finally {
      setUpdatingId(null)
    }
  }

  const pendingCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Every order that came through the store, sorted by most recent.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
            <span className="grid h-2 w-2 place-items-center rounded-full bg-amber-500" />
            {pendingCount} new order{pendingCount > 1 ? 's' : ''} awaiting review
          </div>
        )}
      </header>

      <section className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            leadingIcon={<IconSearch width={16} height={16} />}
            placeholder="Search by order id, name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            className="sm:w-48"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink-500">
            No orders match your filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-ink-50/50">
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setOpenId(o.id)}
                          className="text-sm font-medium text-ink-900 hover:text-brand-700"
                        >
                          {o.id}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-ink-900">
                            {o.customer}
                          </p>
                          <p className="text-xs text-ink-500">{o.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-600">
                        {formatDate(o.date)}
                      </td>
                      <td className="px-5 py-3 text-ink-600">{o.itemCount}</td>
                      <td className="px-5 py-3 text-sm font-medium text-ink-900">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={paymentTones[paymentOf(o)]}>
                          {paymentOf(o)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <StatusSelect
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(next) => updateStatus(o.id, next)}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setOpenId(o.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-ink-700 hover:text-ink-900"
                        >
                          View
                          <IconChevronRight width={12} height={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink-100 md:hidden">
              {filtered.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(o.id)}
                      className="text-left"
                    >
                      <p className="text-sm font-medium text-ink-900">{o.id}</p>
                      <p className="text-xs text-ink-500">
                        {o.customer} · {formatDate(o.date)}
                      </p>
                    </button>
                    <div className="flex flex-col items-end gap-1">
                      <Badge tone={badgeTones[o.status]}>{o.status}</Badge>
                      <Badge tone={paymentTones[paymentOf(o)]}>
                        {paymentOf(o)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-500">
                      {o.itemCount} item{o.itemCount > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-ink-900">
                      {formatPrice(o.total)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <StatusSelect
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(next) => updateStatus(o.id, next)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Modal
        open={!!opened}
        onClose={() => setOpenId(null)}
        size="lg"
        title={opened ? `Order ${opened.id}` : undefined}
        description={opened ? formatDate(opened.date) : undefined}
        footer={
          opened ? (
            <>
              <Button variant="secondary" onClick={() => setOpenId(null)}>
                Close
              </Button>
              <StatusSelect
                value={opened.status}
                disabled={updatingId === opened.id}
                onChange={(next) => updateStatus(opened.id, next)}
              />
            </>
          ) : null
        }
      >
        {opened && <OrderDetail order={opened} />}
      </Modal>
    </div>
  )
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: OrderStatus
  disabled?: boolean
  onChange: (next: OrderStatus) => void
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-brand-100 ${
        value === 'delivered'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : value === 'cancelled'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : value === 'pending'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-brand-200 bg-brand-50 text-brand-700'
      }`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s[0].toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  )
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Items
        </p>
        <ul className="mt-3 divide-y divide-ink-100 rounded-xl border border-ink-100">
          {order.items.map((item, i) => (
            <li key={item.productId + i} className="flex gap-3 p-3">
              <img
                src={item.image}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-ink-500">{item.variant}</p>
                )}
                <p className="mt-0.5 text-xs text-ink-500">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-ink-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Customer
        </p>
        <div className="mt-3 space-y-1 text-sm text-ink-700">
          <p className="font-medium text-ink-900">{order.customer}</p>
          <p>{order.email}</p>
          {order.phone && <p>{order.phone}</p>}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Shipping address
        </p>
        <address className="mt-3 text-sm not-italic leading-relaxed text-ink-700">
          {order.address.line1}
          {order.address.line2 && (
            <>
              <br />
              {order.address.line2}
            </>
          )}
          <br />
          {order.address.city}, {order.address.region}{' '}
          {order.address.postalCode}
          <br />
          {order.address.country}
        </address>
      </div>
      {order.notes && (
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Order notes
          </p>
          <p className="mt-2 rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-2 text-sm text-ink-700">
            {order.notes}
          </p>
        </div>
      )}
      <div className="sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
          Payment
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <Badge tone={paymentTones[paymentOf(order)]}>
            {paymentOf(order)}
          </Badge>
          {order.paymentMethod && (
            <span className="text-ink-500 capitalize">{order.paymentMethod}</span>
          )}
          {order.stripePaymentIntentId && (
            <span className="font-mono text-xs text-ink-400">
              {order.stripePaymentIntentId}
            </span>
          )}
        </div>
      </div>
      <div className="sm:col-span-2 rounded-xl border border-ink-100 bg-ink-50/40 p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="font-medium text-ink-900">
              {formatPrice(order.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Shipping</dt>
            <dd className="font-medium text-ink-900">
              {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Tax</dt>
            <dd className="font-medium text-ink-900">
              {formatPrice(order.tax)}
            </dd>
          </div>
          <div className="border-t border-ink-100 pt-2">
            <div className="flex items-center justify-between">
              <dt className="text-base font-semibold text-ink-900">Total</dt>
              <dd className="text-base font-semibold text-ink-900">
                {formatPrice(order.total)}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  )
}
