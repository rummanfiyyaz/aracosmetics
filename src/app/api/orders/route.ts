import { NextResponse } from 'next/server'
import { listOrders } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ orders: await listOrders() })
}
