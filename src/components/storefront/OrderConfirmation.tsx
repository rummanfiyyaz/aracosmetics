import Link from 'next/link'
import { formatDate, formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { IconChevronRight, IconShield, IconTruck } from '@/components/icons'
import { ClearCartOnPaid } from '@/components/storefront/ClearCartOnPaid'
import type { Order, PaymentStatus } from '@/data/types'

const badgeTones: Record<
  Order['status'],
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

export function OrderConfirmation({ order }: { order: Order }) {
  const paymentStatus = order.paymentStatus ?? 'unpaid'
  const paid = paymentStatus === 'paid'

  return (
    <section className="container-page py-8 lg:py-12">
      <ClearCartOnPaid paid={paid} />
      <nav className="flex items-center gap-2 text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-800">
          Home
        </Link>
        <IconChevronRight width={12} height={12} />
        <span className="text-ink-800">Order {order.id}</span>
      </nav>

      <div
        className={`mt-6 rounded-3xl border p-6 sm:p-10 ${
          paid
            ? 'border-emerald-100 bg-emerald-50/60'
            : paymentStatus === 'failed'
              ? 'border-rose-100 bg-rose-50/60'
              : 'border-amber-100 bg-amber-50/60'
        }`}
      >
        <div
          className={`grid h-12 w-12 place-items-center rounded-full text-white ${
            paid
              ? 'bg-emerald-500'
              : paymentStatus === 'failed'
                ? 'bg-rose-500'
                : 'bg-amber-500'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-ink-900">
          {paid
            ? `Thank you, ${order.customer.split(' ')[0]}.`
            : paymentStatus === 'failed'
              ? 'Payment did not go through'
              : 'Your order is waiting for payment'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-600 sm:text-base">
          {paid
            ? `A confirmation is on its way to ${order.email}. We’ll email tracking as soon as your order ships.`
            : paymentStatus === 'failed'
              ? 'Stripe could not complete this payment. Your cart items are still available — please try checkout again.'
              : 'If you just paid, this page will update in a few seconds. Keep this order number for your records.'}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <Badge tone={badgeTones[order.status]}>{order.status}</Badge>
          <Badge tone={paymentTones[paymentStatus]}>{paymentStatus}</Badge>
          <span className="text-ink-500">
            Order <span className="font-medium text-ink-900">{order.id}</span>
          </span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-500">Placed {formatDate(order.date)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-ink-900">Items</p>
          <ul className="mt-4 divide-y divide-ink-100">
            {order.items.map((item, i) => (
              <li key={item.productId + i} className="flex gap-4 py-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-sm font-medium text-ink-900 hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  {item.variant && (
                    <p className="mt-0.5 text-xs text-ink-500">{item.variant}</p>
                  )}
                  <p className="mt-2 text-sm text-ink-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-ink-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-medium text-ink-900">
                {formatPrice(order.subtotal)}
              </dd>
            </div>
            {order.shipping > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Shipping</dt>
                <dd className="font-medium text-ink-900">
                  {formatPrice(order.shipping)}
                </dd>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Tax</dt>
                <dd className="font-medium text-ink-900">
                  {formatPrice(order.tax)}
                </dd>
              </div>
            )}
            <div className="border-t border-ink-100 pt-3">
              <div className="flex items-center justify-between">
                <dt className="text-base font-semibold text-ink-900">Total</dt>
                <dd className="text-lg font-semibold text-ink-900">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">
              Shipping address
            </p>
            <address className="mt-3 text-sm not-italic leading-relaxed text-ink-700">
              {order.customer}
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.region}
              {order.address.postalCode ? ` ${order.address.postalCode}` : ''}
              <br />
              {order.address.country}
            </address>
            <div className="mt-4 border-t border-ink-100 pt-4 text-sm text-ink-500">
              {order.email}
              {order.phone && (
                <>
                  <br />
                  {order.phone}
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold text-ink-900">What&rsquo;s next</p>
            <ul className="mt-3 space-y-3 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <IconShield width={16} height={16} className="mt-0.5 text-ink-400" />
                {paid
                  ? 'Payment received securely through Stripe.'
                  : 'Complete payment to confirm this order.'}
              </li>
              <li className="flex items-start gap-2">
                <IconTruck width={16} height={16} className="mt-0.5 text-ink-400" />
                {paid
                  ? 'We pack paid orders within 1–2 business days and ship worldwide.'
                  : 'Shipping starts after the payment is confirmed.'}
              </li>
            </ul>
          </div>

          <Link href={paid ? '/' : '/checkout'} className="block">
            <Button variant="secondary" fullWidth size="lg">
              {paid ? 'Keep shopping' : 'Return to checkout'}
            </Button>
          </Link>
        </aside>
      </div>
    </section>
  )
}
