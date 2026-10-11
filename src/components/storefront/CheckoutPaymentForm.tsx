'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'
import { countryCode } from '@/data/countries'

const fieldStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1c1917',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#a89886' },
    },
    invalid: { color: '#be123c' },
  },
}

function CardField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="rounded-lg border border-ink-200 bg-white px-3.5 py-2.5">
        {children}
      </div>
    </label>
  )
}

export function CheckoutPaymentForm({
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
    postalCode: string
    country: string
  }
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    const card = elements.getElement(CardNumberElement)
    if (!card) return

    setSubmitting(true)
    setError(null)

    const { error: confirmError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: customer,
            email,
            phone: phone || undefined,
            address: {
              line1: address.line1,
              line2: address.line2 || undefined,
              city: address.city,
              state: address.region,
              postal_code: address.postalCode,
              country: countryCode(address.country),
            },
          },
        },
      })

    if (confirmError) {
      setError(confirmError.message || 'Payment could not be completed.')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      router.push(`/checkout/success?payment_intent=${paymentIntent.id}`)
      return
    }

    setError('Payment is still processing. Please wait a moment and refresh.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <CardField label="Card number">
        <CardNumberElement options={fieldStyle} />
      </CardField>
      <div className="grid grid-cols-2 gap-4">
        <CardField label="Expiry">
          <CardExpiryElement options={fieldStyle} />
        </CardField>
        <CardField label="CVC">
          <CardCvcElement options={fieldStyle} />
        </CardField>
      </div>
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}
      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={!stripe || submitting}
      >
        {submitting ? 'Processing…' : `Pay ${formatPrice(amount)}`}
      </Button>
    </form>
  )
}
