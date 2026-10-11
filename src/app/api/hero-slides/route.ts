import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createHeroSlide, listHeroSlides } from '@/lib/db'
import type { HeroSlide } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ slides: await listHeroSlides() })
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<HeroSlide>

  const required: (keyof HeroSlide)[] = ['image', 'title', 'ctaLabel', 'ctaHref']
  for (const key of required) {
    if (!body[key] || typeof body[key] !== 'string') {
      return NextResponse.json(
        { error: `Missing required field: ${key}` },
        { status: 400 },
      )
    }
  }

  const slide = await createHeroSlide({
    image: body.image!,
    eyebrow: body.eyebrow?.trim() ?? '',
    title: body.title!.trim(),
    highlight: body.highlight?.trim() || undefined,
    description: body.description?.trim() ?? '',
    ctaLabel: body.ctaLabel!.trim(),
    ctaHref: body.ctaHref!.trim(),
    hidden: !!body.hidden,
    sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
  })

  revalidatePath('/', 'layout')
  return NextResponse.json({ slide }, { status: 201 })
}
