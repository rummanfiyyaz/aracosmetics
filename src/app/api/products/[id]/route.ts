import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { deleteProduct, getProductById, updateProduct } from '@/lib/db'
import type { Product } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const product = await getProductById(params.id)
  if (!product)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const patch = (await request.json()) as Partial<Product>
  const product = await updateProduct(params.id, patch)
  if (!product)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ product })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const removed = await deleteProduct(params.id)
  if (!removed)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
