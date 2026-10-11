import Link from 'next/link'
import { resolveCheckoutOrder } from '@/lib/resolve-order'
import { OrderConfirmation } from '@/components/storefront/OrderConfirmation'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: { session_id?: string; payment_intent?: string }
}) {
  const order = await resolveCheckoutOrder({
    sessionId: searchParams.session_id,
    paymentIntentId: searchParams.payment_intent,
  })

  if (!order) {
    return (
      <section className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card">
          <h1 className="text-2xl font-semibold text-ink-900">
            {searchParams.payment_intent || searchParams.session_id
              ? 'Payment received'
              : 'Missing payment details'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {searchParams.payment_intent || searchParams.session_id
              ? 'Stripe confirmed the payment. Refresh this page in a moment if your order details are not showing yet.'
              : 'Complete checkout on this site to see your order confirmation.'}
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button size="lg">Back to store</Button>
          </Link>
        </div>
      </section>
    )
  }

  return <OrderConfirmation order={order} />
}
