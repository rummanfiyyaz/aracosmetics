import { NextResponse } from 'next/server'
import { createOrder, getProductById, updateOrder } from '@/lib/db'
import { calcOrderTotals, CURRENCY, toCents } from '@/lib/pricing'
import { getSiteUrl, getStripe, isStripeConfigured } from '@/lib/stripe'
import type { OrderItem, ShippingAddress } from '@/data/types'

export const dynamic = 'force-dynamic'

interface CheckoutPayload {
  customer: string
  email: string
  phone?: string
  address: ShippingAddress
  notes?: string
  items: Array<{
    productId: string
    variant?: string
    quantity: number
  }>
}

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

  if (!body.customer?.trim())
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
  if (!body.email?.trim())
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  if (
    !body.address?.line1?.trim() ||
    !body.address?.city?.trim() ||
    !body.address?.region?.trim() ||
    !body.address?.postalCode?.trim() ||
    !body.address?.country?.trim()
  )
    return NextResponse.json({ error: 'Shipping address is incomplete' }, { status: 400 })
  if (!body.items?.length)
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  const orderItems: OrderItem[] = []
  for (const line of body.items) {
    const product = await getProductById(line.productId)
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${line.productId}` },
        { status: 400 },
      )
    }
    if (product.status !== 'active') {
      return NextResponse.json(
        { error: `${product.name} is no longer available` },
        { status: 400 },
      )
    }
    if (product.stock < line.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for ${product.name}` },
        { status: 400 },
      )
    }
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      variant: line.variant,
      price: product.discountPrice ?? product.price,
      quantity: line.quantity,
    })
  }

  const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const totals = calcOrderTotals(subtotal)
  const itemCount = orderItems.reduce((sum, it) => sum + it.quantity, 0)

  const order = await createOrder({
    customer: body.customer.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim(),
    items: orderItems,
    itemCount,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    address: body.address,
    notes: body.notes?.trim(),
    paymentMethod: 'stripe',
    paymentStatus: 'unpaid',
    status: 'pending',
  })

  try {
    const stripe = getStripe()
    const siteUrl = getSiteUrl()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?canceled=1`,
      billing_address_collection: 'auto',
      shipping_options:
        totals.shipping === 0
          ? [
              {
                shipping_rate_data: {
                  display_name: 'Free international shipping',
                  type: 'fixed_amount',
                  fixed_amount: { amount: 0, currency: CURRENCY.toLowerCase() },
                },
              },
            ]
          : [
              {
                shipping_rate_data: {
                  display_name: 'Standard international shipping',
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: toCents(totals.shipping),
                    currency: CURRENCY.toLowerCase(),
                  },
                },
              },
            ],
      line_items: [
        ...orderItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: CURRENCY.toLowerCase(),
            unit_amount: toCents(item.price),
            product_data: {
              name: item.variant ? `${item.name} — ${item.variant}` : item.name,
              ...(item.image?.startsWith('https://') &&
              !item.image.includes('imgres')
                ? { images: [item.image] }
                : {}),
            },
          },
        })),
        ...(toCents(totals.tax) > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: CURRENCY.toLowerCase(),
                  unit_amount: toCents(totals.tax),
                  product_data: { name: 'Estimated tax' },
                },
              },
            ]
          : []),
      ],
    })

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL')
    }

    await updateOrder(order.id, {
      stripeCheckoutSessionId: session.id,
    })

    return NextResponse.json({ url: session.url, orderId: order.id })
  } catch (err) {
    await updateOrder(order.id, { paymentStatus: 'failed', status: 'cancelled' })
    const message =
      err instanceof Error ? err.message : 'Unable to start Stripe checkout'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
