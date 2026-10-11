'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import {
  IconBox,
  IconClipboard,
  IconClose,
  IconGrid,
  IconLogo,
  IconMenu,
  IconSettings,
  IconTrend,
} from '@/components/icons'

const navItems = [
  { href: '/admin', exact: true, label: 'Dashboard', icon: <IconGrid /> },
  { href: '/admin/products', label: 'Products', icon: <IconBox /> },
  { href: '/admin/categories', label: 'Categories', icon: <IconGrid /> },
  { href: '/admin/hero-slides', label: 'Hero slides', icon: <IconTrend /> },
  { href: '/admin/orders', label: 'Orders', icon: <IconClipboard /> },
  { href: '/admin/settings', label: 'Settings', icon: <IconSettings /> },
]

export function AdminLayoutClient({
  children,
  storeName,
}: {
  children: ReactNode
  storeName: string
}) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-ink-50/60">{children}</div>
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const signOut = async () => {
    setSigningOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      router.replace('/admin/login')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-ink-50/60">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-white">
              <IconLogo width={16} height={16} />
            </span>
            <span className="text-sm font-semibold text-ink-900">
              {storeName} Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-ink-100 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-white">
                <IconLogo width={20} height={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{storeName}</p>
                <p className="text-xs text-ink-500">Admin panel</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-ink-900 text-white'
                    : 'text-ink-700 hover:bg-ink-100',
                )}
              >
                <span className="text-current">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="space-y-1 border-t border-ink-100 p-4 text-xs">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink-600 hover:bg-ink-100"
            >
              ← Back to storefront
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-ink-600 hover:bg-ink-100 disabled:opacity-60"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </aside>
        {open && (
          <div
            className="fixed inset-0 z-20 bg-ink-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
