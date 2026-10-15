'use client'

import { useEffect, useRef, useState } from 'react'

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.STRIPE_PUBLISHABLE_KEY ||
  ''

const appearance = {
  theme: 'stripe',
  labels: 'auto',
  inputs: 'spaced',
  variables: {
    borderRadius: '4px',
    colorBackground: '#ffffff',
    colorDanger: '#df1b41',
    colorPrimary: '#0570de',
    colorSuccess: '#00c853',
    colorText: '#30313d',
    fontFamily: 'default',
    fontSizeBase: '16px',
    spacingUnit: '4px',
  },
} as const

interface CheckoutPaymentProps {
  clientSecret?: string
  orderId?: string
  amount?: number
  customer?: string
  email?: string
  phone?: string
  address?: {
    line1: string
    line2?: string
    city: string
    region: string
    postalCode?: string
    country: string
  }
}

export function CheckoutPayment({
  clientSecret: clientSecretProp,
  orderId,
}: CheckoutPaymentProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isCancelled = false
    let currentForm: any = null

    async function initCheckout() {
      try {
        setError(null)
        setLoading(true)

        if (!publishableKey) {
          throw new Error(
            'Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
          )
        }

        // Wait for Stripe.js (loaded via https://js.stripe.com/dahlia/stripe.js in <head>)
        let stripeGlobal = typeof window !== 'undefined' ? (window as any).Stripe : null
        if (!stripeGlobal) {
          for (let i = 0; i < 50; i++) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            if (typeof window !== 'undefined' && (window as any).Stripe) {
              stripeGlobal = (window as any).Stripe
              break
            }
          }
        }

        if (!stripeGlobal) {
          throw new Error('Stripe.js failed to load from https://js.stripe.com/dahlia/stripe.js')
        }

        const stripe = stripeGlobal(publishableKey, {
          betas: ['custom_checkout_payment_form_1'],
        })

        // Fetch client secret if not provided as prop
        const clientSecret = clientSecretProp
          ? clientSecretProp
          : fetch('/api/create-checkout-session', { method: 'POST' })
              .then((response) => response.json())
              .then((json) => json.client_secret)

        const checkout = stripe.initCheckoutFormSdk({ clientSecret, appearance })
        const form = checkout.createForm({ layout: 'expanded' })
        currentForm = form

        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        form.mount('#checkout-form')
        setLoading(false)

        const loadActionsResult = await checkout.loadActions()
        if (isCancelled) return

        if (loadActionsResult.type === 'success') {
          form.on('confirm', async (event: any) => {
            try {
              const successUrl = `${window.location.origin}/checkout/success${
                orderId ? `?order_id=${encodeURIComponent(orderId)}` : ''
              }`
              const confirmResult = await loadActionsResult.actions.confirm({
                formConfirmEvent: event,
                returnUrl: successUrl,
              })
              if (confirmResult?.error) {
                setError(confirmResult.error.message || 'Payment confirmation error')
              }
            } catch (err: any) {
              console.error('Payment confirmation error:', err)
              setError(err?.message || 'Payment confirmation error')
            }
          })
        } else if (loadActionsResult.type === 'error') {
          setError(loadActionsResult.error?.message || 'Failed to load checkout actions')
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Embedded form initialization error:', err)
          setError(err?.message || 'Failed to initialize payment form')
          setLoading(false)
        }
      }
    }

    initCheckout()

    return () => {
      isCancelled = true
      try {
        if (currentForm?.destroy) currentForm.destroy()
        else if (currentForm?.unmount) currentForm.unmount()
      } catch {
        // ignore unmount errors
      }
    }
  }, [clientSecretProp])

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-8 text-sm text-ink-500">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          Loading secure checkout form…
        </div>
      )}
      <div id="checkout-form" ref={containerRef} />
    </div>
  )
}
