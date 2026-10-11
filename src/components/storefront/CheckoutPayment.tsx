'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutPaymentForm } from './CheckoutPaymentForm'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

export function CheckoutPayment({
  clientSecret,
  amount,
  customer,
  email,
  phone,
  address,
}: {
  clientSecret: string
  amount: number
  customer: string
  email: string
  phone?: string
  address: {
    line1: string
    line2?: string
    city: string
    region: string
    postalCode?: string
    country: string
  }
}) {
  if (!stripePromise) {
    return (
      <p className="text-sm text-rose-700">
        Stripe publishable key is missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        to your environment.
      </p>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#b86b62',
            colorBackground: '#ffffff',
            colorText: '#1c1917',
            colorDanger: '#be123c',
            borderRadius: '8px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      }}
    >
      <CheckoutPaymentForm
        clientSecret={clientSecret}
        amount={amount}
        customer={customer}
        email={email}
        phone={phone}
        address={address}
      />
    </Elements>
  )
}
