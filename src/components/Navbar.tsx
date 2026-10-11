'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { cn } from '@/lib/cn'
import {
  IconCart,
  IconClose,
  IconLogo,
  IconMenu,
  IconSearch,
} from './icons'
import { formatPrice } from '@/lib/format'
import type { Category, Product } from '@/data/types'

export function Navbar({
  products,
  categories,
  storeName,
}: {
  products: Product[]
  categories: Category[]
  storeName: string
}) {
  const { count, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery('')
  }, [pathname])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [query, products])

  const navLinks = [
    { href: '/', label: 'Home' },
    ...categories.map((c) => ({ href: `/${c.slug}`, label: c.name })),
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <div className="bg-ink-900 text-white">
        <div className="container-page flex flex-col items-center justify-center gap-0.5 py-2 text-center text-[11px] sm:flex-row sm:gap-3 sm:text-xs">
          <span>Free shipping on all orders</span>
          <span className="hidden text-ink-400 sm:inline" aria-hidden>
            ·
          </span>
          <span>Secure checkout · Ships worldwide</span>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-white">
              <IconLogo width={20} height={20} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink-900">
              {storeName}
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-ink-900 bg-ink-100'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded-lg p-2 text-ink-700 hover:bg-ink-100"
              aria-label="Search"
            >
              <IconSearch />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative rounded-lg p-2 text-ink-700 hover:bg-ink-100"
              aria-label="Open cart"
            >
              <IconCart />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink-900 px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-ink-100 bg-white animate-slide-up">
            <div className="container-page py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (results[0]) router.push(`/product/${results[0].slug}`)
                }}
                className="relative"
              >
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search skincare, makeup, fragrance…"
                  className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-11 pr-11 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-500 hover:bg-ink-100"
                  aria-label="Close search"
                >
                  <IconClose />
                </button>
              </form>
              {query && (
                <div className="mt-3">
                  {results.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                      No products match &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/product/${p.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-ink-50"
                          >
                            <img
                              src={p.images[0]}
                              alt=""
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink-900">
                                {p.name}
                              </p>
                              <p className="text-xs text-ink-500">
                                {formatPrice(p.discountPrice ?? p.price)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          menuOpen ? '' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-2xl transition-transform',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-white">
                <IconLogo width={20} height={20} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-ink-900">
                {storeName}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-ink-100 text-ink-900'
                    : 'text-ink-700 hover:bg-ink-50',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  )
}
