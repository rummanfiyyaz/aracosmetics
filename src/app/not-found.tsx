import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50/60 px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Nothing here.
        </h1>
        <p className="mt-3 text-base text-ink-500">
          The page you&rsquo;re looking for either moved or never existed.
          Let&rsquo;s head back home and try again.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg">Take me home</Button>
          </Link>
          <Link href="/skincare">
            <Button size="lg" variant="secondary">
              Shop skincare
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
