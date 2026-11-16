import Link from 'next/link'
import type { Category } from '@/data/types'
import {
  IconHeadphones,
  IconLogo,
  IconRefresh,
  IconShield,
  IconTruck,
} from './icons'

export function Footer({
  categories,
  storeName,
  description,
}: {
  categories: Category[]
  storeName: string
  description: string
}) {
  return (
    <footer className="mt-20 border-t border-brand-500/20 bg-gradient-to-b from-[#181412] via-[#14100e] to-[#0c0908] text-ink-300">
      {/* Top Value Propositions */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <IconTruck width={20} height={20} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">Free Shipping</p>
                <p className="text-[11px] text-ink-400">On all worldwide orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <IconRefresh width={20} height={20} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">30-Day Returns</p>
                <p className="text-[11px] text-ink-400">Hassle-free guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <IconShield width={20} height={20} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">Secure Checkout</p>
                <p className="text-[11px] text-ink-400">Stripe encrypted payments</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 border border-white/10 text-brand-400">
                <IconHeadphones width={20} height={20} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">Order Help</p>
                <p className="text-[11px] text-ink-400">Dedicated support team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink-950 shadow-md group-hover:scale-105 transition-transform">
                <IconLogo width={22} height={22} />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                {storeName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              {description}
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                Join the Ritual
              </p>
              <p className="mt-1 text-xs text-ink-400">
                Subscribe for private releases, member offers and rituals.
              </p>
              <SubscribeForm />
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <FooterCol title="Shop">
              {categories.map((c) => (
                <FooterLink key={c.slug} href={`/${c.slug}`}>
                  {c.name}
                </FooterLink>
              ))}
            </FooterCol>

            <FooterCol title="Company">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterCol>

            <FooterCol title="Support">
              <FooterLink href="/shipping">Shipping Policy</FooterLink>
              <FooterLink href="/returns">Returns &amp; Refunds</FooterLink>
              <FooterLink href="/contact">Order Help</FooterLink>
            </FooterCol>

            <FooterCol title="Legal">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
            </FooterCol>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="text-ink-400 hidden md:inline">
              Secure 256-Bit SSL Encrypted
            </span>
            <div className="flex items-center gap-2.5">
              <SocialButton
                label="Facebook"
                href="https://www.facebook.com/profile.php?id=61592663164060"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.5-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8v3.1h2.3V22h3.2z" />
                </svg>
              </SocialButton>
              <SocialButton label="Instagram" href="#">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </SocialButton>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SubscribeForm() {
  return (
    <form className="mt-3 flex max-w-sm gap-2" action="#">
      <input
        type="email"
        required
        placeholder="you@email.com"
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-ink-400 focus:border-brand-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 active:scale-95 transition-all"
      >
        Subscribe
      </button>
    </form>
  )
}

function FooterCol({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-200">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-ink-400 hover:text-white hover:translate-x-0.5 transition-all inline-block"
      >
        {children}
      </Link>
    </li>
  )
}

function SocialButton({
  label,
  href,
  children,
}: {
  label: string
  href: string
  children: React.ReactNode
}) {
  const external = /^https?:\/\//.test(href)
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-ink-300 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all"
    >
      {children}
    </a>
  )
}
