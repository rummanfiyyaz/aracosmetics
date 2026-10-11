import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  deleteHeroSlide,
  getHeroSlideById,
  updateHeroSlide,
} from '@/lib/db'
import type { HeroSlide } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const slide = await getHeroSlideById(params.id)
  if (!slide)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ slide })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const patch = (await request.json()) as Partial<HeroSlide>
  const slide = await updateHeroSlide(params.id, patch)
  if (!slide)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ slide })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const removed = await deleteHeroSlide(params.id)
  if (!removed)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/', 'layout')
  return NextResponse.json({ ok: true })
}
