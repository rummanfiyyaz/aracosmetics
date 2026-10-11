'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { IconClose, IconMinus, IconPlus, IconTrash, IconCart } from './icons'

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, updateQuantity, removeItem, count } =
    useCart()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div>
            <p className="text-base font-semibold text-ink-900">Your Cart</p>
            <p className="text-xs text-ink-500">
              {count === 0
                ? 'Nothing here yet'
                : `${count} item${count > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
            aria-label="Close cart"
          >
            <IconClose />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-500">
              <IconCart width={26} height={26} />
            </div>
            <div>
              <p className="text-base font-semibold text-ink-900">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Explore our latest arrivals and find something you love.
              </p>
            </div>
            <Button
              onClick={closeCart}
              variant="primary"
              className="mt-3"
              size="md"
            >
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-50"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-700"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="mt-0.5 text-xs text-ink-500">
                            {item.variant}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-ink-400 hover:text-rose-600 transition-colors"
                        aria-label="Remove"
                      >
                        <IconTrash width={16} height={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-lg border border-ink-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center text-ink-600 hover:bg-ink-50 rounded-l-lg"
                          aria-label="Decrease"
                        >
                          <IconMinus width={14} height={14} />
                        </button>
                        <span className="min-w-[2rem] px-1 text-center text-sm font-medium text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center text-ink-600 hover:bg-ink-50 rounded-r-lg"
                          aria-label="Increase"
                        >
                          <IconPlus width={14} height={14} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-ink-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="space-y-3 border-t border-ink-100 bg-ink-50/40 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">Subtotal</span>
                <span className="text-base font-semibold text-ink-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-ink-500">
                Free shipping · Taxes included
              </p>
              <div className="grid gap-2">
                <Link href="/cart" onClick={closeCart} className="block">
                  <Button variant="primary" fullWidth size="lg">
                    View Cart & Checkout
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  fullWidth
                  size="md"
                  onClick={closeCart}
                >
                  Continue shopping
                </Button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
