import { NextResponse } from 'next/server'
import {
  createCheckoutOrder,
  failCheckoutOrder,
  validateCheckoutPayload,
  type CheckoutPayload,
} from '@/lib/checkout-order'
import { countryCode } from '@/data/countries'
import { CURRENCY, toCents } from '@/lib/pricing'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { updateOrder } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          'Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.',
      },
      { status: 503 },
    )
  }

  const body = (await request.json()) as CheckoutPayload
  const invalid = validateCheckoutPayload(body)
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 })
  }

  const created = await createCheckoutOrder(body)
  if ('error' in created) {
    return NextResponse.json(
      { error: created.error },
      { status: created.status },
    )
  }

  const { order } = created

  try {
    const stripe = getStripe()
    const intent = await stripe.paymentIntents.create({
      amount: toCents(order.total),
      currency: CURRENCY.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: order.email,
      metadata: { orderId: order.id },
      shipping: {
        name: order.customer,
        phone: order.phone,
        address: {
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          state: order.address.region,
          postal_code: order.address.postalCode,
          country: countryCode(order.address.country),
        },
      },
    })

    if (!intent.client_secret) {
      throw new Error('Stripe did not return a client secret')
    }

    await updateOrder(order.id, { stripePaymentIntentId: intent.id })

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      orderId: order.id,
    })
  } catch (err) {
    await failCheckoutOrder(order.id)
    const message =
      err instanceof Error ? err.message : 'Unable to start payment'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
