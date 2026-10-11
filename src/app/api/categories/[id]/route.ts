import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  deleteCategory,
  getCategoryById,
  isCategorySlugTaken,
  updateCategory,
} from '@/lib/db'
import { RESERVED_SLUGS } from '@/data/categories'
import type { Category } from '@/data/types'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const category = await getCategoryById(params.id)
  if (!category)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ category })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const patch = (await request.json()) as Partial<Category>

  if (patch.slug !== undefined) {
    const slug = patch.slug.trim().toLowerCase()
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
    if (await isCategorySlugTaken(slug, params.id)) {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists.` },
        { status: 409 },
      )
    }
    patch.slug = slug
  }

  const category = await updateCategory(params.id, patch)
  if (!category)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ category })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const removed = await deleteCategory(params.id)
  if (!removed)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
