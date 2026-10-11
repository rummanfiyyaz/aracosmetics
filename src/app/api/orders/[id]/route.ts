import { NextResponse } from 'next/server'
import { getOrder, updateOrderStatus } from '@/lib/db'
import type { OrderStatus } from '@/data/types'

export const dynamic = 'force-dynamic'

const ALLOWED_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const order = await getOrder(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as { status?: string }
  if (!body.status || !ALLOWED_STATUSES.includes(body.status as OrderStatus)) {
    return NextResponse.json(
      { error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }
  const order = await updateOrderStatus(params.id, body.status as OrderStatus)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}
