import Link from 'next/link'
import type { Category } from '@/data/types'
import { IconLogo } from './icons'

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
    <footer className="mt-20 border-t border-ink-100 bg-ink-50/40">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900 text-white">
                <IconLogo width={22} height={22} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-ink-900">
                {storeName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              {description}
            </p>
            <SubscribeForm />
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-8 lg:grid-cols-4">
            <FooterCol title="Shop">
              {categories.map((c) => (
                <FooterLink key={c.slug} href={`/${c.slug}`}>
                  {c.name}
                </FooterLink>
              ))}
            </FooterCol>
            <FooterCol title="Company">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterCol>
            <FooterCol title="Support">
              <FooterLink href="/shipping">Shipping</FooterLink>
              <FooterLink href="/returns">Returns</FooterLink>
              <FooterLink href="/contact">Order help</FooterLink>
            </FooterCol>
            <FooterCol title="Legal">
              <FooterLink href="/privacy">Privacy policy</FooterLink>
              <FooterLink href="/terms">Terms of service</FooterLink>
            </FooterCol>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-100 pt-6 text-sm text-ink-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <SocialButton
              label="Facebook"
              href="https://www.facebook.com/profile.php?id=61592663164060"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.5-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8v3.1h2.3V22h3.2z" />
              </svg>
            </SocialButton>
            <SocialButton label="Instagram" href="#">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
    </footer>
  )
}

function SubscribeForm() {
  return (
    <form className="mt-5 flex max-w-sm gap-2" action="#">
      <input
        type="email"
        required
        placeholder="you@email.com"
        className="input"
      />
      <button className="btn-primary shrink-0" formMethod="post">
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
      <p className="text-sm font-semibold text-ink-900">{title}</p>
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
        className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
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
      className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink-700 border border-ink-100 hover:bg-ink-900 hover:text-white transition-colors"
    >
      {children}
    </a>
  )
}
