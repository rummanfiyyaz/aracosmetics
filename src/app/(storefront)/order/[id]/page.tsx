import Link from 'next/link'
import { resolveCheckoutOrder } from '@/lib/resolve-order'
import { OrderConfirmation } from '@/components/storefront/OrderConfirmation'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { session_id?: string; payment_intent?: string }
}) {
  const order = await resolveCheckoutOrder({
    orderId: params.id,
    sessionId: searchParams.session_id,
    paymentIntentId: searchParams.payment_intent,
  })

  if (!order) {
    return (
      <section className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-card">
          <h1 className="text-2xl font-semibold text-ink-900">
            {searchParams.session_id
              ? 'Payment received'
              : 'Order not found'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {searchParams.session_id
              ? 'Stripe confirmed the payment. Your order is being recorded — check Admin → Orders, or refresh this page in a moment.'
              : 'We could not find this order. If you just paid, use the link from your Stripe receipt or email.'}
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
