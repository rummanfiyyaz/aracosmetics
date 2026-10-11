import 'server-only'
import type Stripe from 'stripe'
import {
  getOrder,
  getOrderByPaymentIntent,
  getOrderByStripeSession,
  markOrderPaid,
  updateOrder,
} from './db'
import { getStripe } from './stripe'
import type { Order } from '@/data/types'

function paymentIntentId(session: Stripe.Checkout.Session): string | undefined {
  const intent = session.payment_intent
  if (!intent) return undefined
  return typeof intent === 'string' ? intent : intent.id
}

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<Order | undefined> {
  const orderId =
    session.metadata?.orderId ||
    session.client_reference_id ||
    undefined

  const order =
    (orderId ? await getOrder(orderId) : undefined) ||
    (await getOrderByStripeSession(session.id))

  if (!order) return undefined

  if (session.payment_status !== 'paid') {
    if (order.paymentStatus !== 'paid') {
      await updateOrder(order.id, {
        paymentStatus: 'failed',
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId(session),
      })
    }
    return getOrder(order.id)
  }

  return markOrderPaid(order.id, {
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId(session),
  })
}

export async function fulfillPaidOrderBySession(
  sessionId: string,
): Promise<Order | undefined> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return fulfillCheckoutSession(session)
}

export async function fulfillPaymentIntent(
  intent: Stripe.PaymentIntent,
): Promise<Order | undefined> {
  const order =
    (intent.metadata?.orderId
      ? await getOrder(intent.metadata.orderId)
      : undefined) || (await getOrderByPaymentIntent(intent.id))

  if (!order) return undefined

  if (intent.status === 'succeeded') {
    return markOrderPaid(order.id, { stripePaymentIntentId: intent.id })
  }

  if (
    intent.status === 'canceled' ||
    intent.status === 'requires_payment_method'
  ) {
    if (order.paymentStatus !== 'paid') {
      await updateOrder(order.id, {
        paymentStatus: 'failed',
        stripePaymentIntentId: intent.id,
      })
    }
  }

  return getOrder(order.id)
}

export async function fulfillPaidOrderByPaymentIntent(
  paymentIntentId: string,
): Promise<Order | undefined> {
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  return fulfillPaymentIntent(intent)
}
