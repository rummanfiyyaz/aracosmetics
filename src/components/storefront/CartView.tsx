'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice } from '@/lib/format'
import { calcOrderTotals } from '@/lib/pricing'
import { Button } from '@/components/ui/Button'
import {
  IconCart,
  IconChevronRight,
  IconMinus,
  IconPlus,
  IconShield,
  IconTrash,
  IconTruck,
} from '@/components/icons'

export function CartView() {
  const { items, subtotal, updateQuantity, removeItem, clear, count } = useCart()
  const { toast } = useToast()

  const { shipping, tax, total } = calcOrderTotals(subtotal)

  if (items.length === 0) {
    return (
      <section className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-500">
            <IconCart width={26} height={26} />
          </div>
          <p className="mt-4 text-lg font-semibold text-ink-900">
            Your cart is empty
          </p>
          <p className="mt-1 text-sm text-ink-500">
            Looks like you haven&rsquo;t added anything yet. Browse the store
            to get started.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button size="lg">Continue shopping</Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="container-page py-8 lg:py-12">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-ink-500">
          <Link href="/" className="hover:text-ink-800">
            Home
          </Link>
          <IconChevronRight width={12} height={12} />
          <span className="text-ink-800">Cart</span>
        </nav>
        <h1 className="mt-3 text-2xl font-semibold text-ink-900 sm:text-3xl">
          Shopping cart
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {count} item{count > 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/product/${item.slug}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:h-28 sm:w-28"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-sm font-medium text-ink-900 hover:text-brand-700 sm:text-base"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="mt-0.5 text-xs text-ink-500">
                          {item.variant}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-ink-500">
                        {formatPrice(item.price)}{' '}
                        <span className="text-ink-400">each</span>
                      </p>
                    </div>
                    <p className="text-base font-semibold text-ink-900 sm:text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-lg border border-ink-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="grid h-9 w-9 place-items-center text-ink-600 hover:bg-ink-50 rounded-l-lg"
                        aria-label="Decrease"
                      >
                        <IconMinus width={14} height={14} />
                      </button>
                      <span className="min-w-[2rem] px-1 text-center text-sm font-medium text-ink-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="grid h-9 w-9 place-items-center text-ink-600 hover:bg-ink-50 rounded-r-lg"
                        aria-label="Increase"
                      >
                        <IconPlus width={14} height={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id)
                        toast({
                          title: 'Removed from cart',
                          description: item.name,
                          variant: 'info',
                        })
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-rose-600 transition-colors"
                    >
                      <IconTrash width={14} height={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-ink-700 hover:text-ink-900"
            >
              ← Continue shopping
            </Link>
            <button
              type="button"
              onClick={() => {
                clear()
                toast({
                  title: 'Cart cleared',
                  variant: 'info',
                })
              }}
              className="text-sm font-medium text-ink-500 hover:text-rose-600"
            >
              Clear cart
            </button>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
            <p className="text-base font-semibold text-ink-900">Order summary</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-medium text-ink-900">
                  {formatPrice(subtotal)}
                </dd>
              </div>
              {shipping > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Shipping</dt>
                  <dd className="font-medium text-ink-900">
                    {formatPrice(shipping)}
                  </dd>
                </div>
              )}
              {tax > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Estimated tax</dt>
                  <dd className="font-medium text-ink-900">{formatPrice(tax)}</dd>
                </div>
              )}
              <div className="border-t border-ink-100 pt-3">
                <div className="flex items-center justify-between">
                  <dt className="text-base font-semibold text-ink-900">Total</dt>
                  <dd className="text-lg font-semibold text-ink-900">
                    {formatPrice(total)}
                  </dd>
                </div>
              </div>
            </dl>
            <Link href="/checkout" className="mt-5 block">
              <Button fullWidth size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <p className="mt-2 text-center text-xs text-ink-500">
              Secure payment with Stripe.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-ink-500">
              <li className="flex items-center gap-2">
                <IconTruck width={14} height={14} />
                Free shipping on all orders
              </li>
              <li className="flex items-center gap-2">
                <IconShield width={14} height={14} />
                Secure checkout
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
