import 'server-only'
import Stripe from 'stripe'

let stripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add your Stripe secret key to .env.local.',
    )
  }
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion:
        '2026-03-25.dahlia; custom_checkout_payment_form_preview=v1' as any,
    })
  }
  return stripe
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  )
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
