import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createProduct, listProducts } from '@/lib/db'
import type { Product } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ products: await listProducts() })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Product>
  const required: (keyof Product)[] = [
    'name',
    'slug',
    'category',
    'price',
    'stock',
    'sku',
    'status',
    'images',
  ]
  for (const key of required) {
    if (body[key] === undefined || body[key] === null) {
      return NextResponse.json(
        { error: `Missing required field: ${key}` },
        { status: 400 },
      )
    }
  }

  const product = await createProduct({
    name: body.name!,
    slug: body.slug!,
    category: body.category!,
    price: Number(body.price),
    discountPrice:
      body.discountPrice !== undefined && body.discountPrice !== null
        ? Number(body.discountPrice)
        : undefined,
    rating: body.rating ?? 0,
    reviewCount: body.reviewCount ?? 0,
    images: body.images!,
    shortDescription: body.shortDescription ?? '',
    description: body.description ?? '',
    features: body.features ?? [],
    specifications: body.specifications ?? {},
    variants: body.variants,
    stock: Number(body.stock),
    sku: body.sku!,
    status: body.status!,
    featured: body.featured ?? false,
    reviews: body.reviews ?? [],
  })
  revalidatePath('/', 'layout')
  return NextResponse.json({ product }, { status: 201 })
}
