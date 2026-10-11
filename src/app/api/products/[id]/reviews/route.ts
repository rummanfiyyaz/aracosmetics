import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { addProductReview } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as {
    author?: string
    rating?: number
    title?: string
    body?: string
  }

  const author = body.author?.trim()
  const title = body.title?.trim()
  const reviewBody = body.body?.trim()
  const rating = Number(body.rating)

  if (!author || !title || !reviewBody) {
    return NextResponse.json(
      { error: 'Name, title and review are required' },
      { status: 400 },
    )
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Rating must be between 1 and 5' },
      { status: 400 },
    )
  }

  const product = await addProductReview(params.id, {
    author,
    title,
    body: reviewBody,
    rating,
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  revalidatePath(`/product/${params.id}`)
  return NextResponse.json({ product }, { status: 201 })
}
