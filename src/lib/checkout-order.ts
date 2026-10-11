import 'server-only'
import { createOrder, getProductById, updateOrder } from '@/lib/db'
import { calcOrderTotals } from '@/lib/pricing'
import type { Order, OrderItem, ShippingAddress } from '@/data/types'

export interface CheckoutPayload {
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

export function validateCheckoutPayload(
  body: CheckoutPayload,
): string | null {
  if (!body.customer?.trim()) return 'Customer name is required'
  if (!body.email?.trim()) return 'Email is required'
  if (
    !body.address?.line1?.trim() ||
    !body.address?.city?.trim() ||
    !body.address?.region?.trim() ||
    !body.address?.country?.trim()
  ) {
    return 'Shipping address is incomplete'
  }
  if (!body.items?.length) return 'Cart is empty'
  return null
}

export async function createCheckoutOrder(
  body: CheckoutPayload,
): Promise<{ order: Order } | { error: string; status: number }> {
  const orderItems: OrderItem[] = []
  for (const line of body.items) {
    const product = await getProductById(line.productId)
    if (!product) {
      return { error: `Product not found: ${line.productId}`, status: 400 }
    }
    if (product.status !== 'active') {
      return { error: `${product.name} is no longer available`, status: 400 }
    }
    if (product.stock < line.quantity) {
      return { error: `Not enough stock for ${product.name}`, status: 400 }
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

  return { order }
}

export async function failCheckoutOrder(orderId: string) {
  await updateOrder(orderId, { paymentStatus: 'failed', status: 'cancelled' })
}
