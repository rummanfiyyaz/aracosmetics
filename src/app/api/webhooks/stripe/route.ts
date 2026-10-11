import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import {
  fulfillCheckoutSession,
  fulfillPaymentIntent,
} from '@/lib/fulfill-order'
import { getOrder, updateOrder } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not set' },
      { status: 500 },
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const payload = await request.text()
  const stripe = getStripe()

  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        await fulfillCheckoutSession(event.data.object)
        break
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object
        const orderId = session.metadata?.orderId
        if (orderId) {
          const order = await getOrder(orderId)
          if (order && order.paymentStatus !== 'paid') {
            await updateOrder(orderId, { paymentStatus: 'failed' })
          }
        }
        break
      }
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        await fulfillPaymentIntent(event.data.object)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('Stripe webhook handler failed', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
