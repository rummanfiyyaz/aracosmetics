import { Suspense } from 'react'
import { CheckoutView } from '@/components/storefront/CheckoutView'

export default function Page() {
  return (
    <Suspense
      fallback={
        <section className="container-page py-16 text-sm text-ink-500">
          Loading checkout…
        </section>
      }
    >
      <CheckoutView />
    </Suspense>
  )
}
