import 'server-only'
import {
  getOrder,
  getOrderByPaymentIntent,
  getOrderByStripeSession,
} from './db'
import {
  fulfillPaidOrderByPaymentIntent,
  fulfillPaidOrderBySession,
} from './fulfill-order'
import type { Order } from '@/data/types'

export async function resolveCheckoutOrder(opts: {
  orderId?: string
  sessionId?: string
  paymentIntentId?: string
}): Promise<Order | undefined> {
  if (opts.paymentIntentId) {
    try {
      const fulfilled = await fulfillPaidOrderByPaymentIntent(
        opts.paymentIntentId,
      )
      if (fulfilled) return fulfilled
    } catch (err) {
      console.error('Could not confirm Stripe payment', err)
    }
    const byIntent = await getOrderByPaymentIntent(opts.paymentIntentId)
    if (byIntent) return byIntent
  }

  if (opts.sessionId) {
    try {
      const fulfilled = await fulfillPaidOrderBySession(opts.sessionId)
      if (fulfilled) return fulfilled
    } catch (err) {
      console.error('Could not confirm Stripe session', err)
    }
    const bySession = await getOrderByStripeSession(opts.sessionId)
    if (bySession) return bySession
  }

  if (opts.orderId) {
    return getOrder(decodeURIComponent(opts.orderId))
  }

  return undefined
}
