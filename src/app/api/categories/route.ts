import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createCategory, isCategorySlugTaken, listCategories } from '@/lib/db'
import { RESERVED_SLUGS } from '@/data/categories'
import type { Category } from '@/data/types'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET() {
  return NextResponse.json({ categories: await listCategories() })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Category>

  const required: (keyof Category)[] = ['name', 'slug', 'image', 'banner']
  for (const key of required) {
    if (!body[key] || typeof body[key] !== 'string') {
      return NextResponse.json(
        { error: `Missing required field: ${key}` },
        { status: 400 },
      )
    }
  }

  const slug = body.slug!.trim().toLowerCase()
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must be lowercase letters, numbers and dashes.' },
      { status: 400 },
    )
  }
  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json(
      { error: `Slug "${slug}" is reserved.` },
      { status: 400 },
    )
  }
  if (await isCategorySlugTaken(slug)) {
    return NextResponse.json(
      { error: `A category with slug "${slug}" already exists.` },
      { status: 409 },
    )
  }

  const category = await createCategory({
    slug,
    name: body.name!.trim(),
    short: body.short?.trim() ?? '',
    description: body.description?.trim() ?? '',
    image: body.image!,
    banner: body.banner!,
    hidden: !!body.hidden,
    sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
  })

  revalidatePath('/', 'layout')
  return NextResponse.json({ category }, { status: 201 })
}
