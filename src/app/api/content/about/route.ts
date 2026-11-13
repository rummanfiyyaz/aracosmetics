import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAboutData, updateAboutData } from '@/lib/db'
import type { AboutPageData } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await getAboutData()
  return NextResponse.json({ data })
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<AboutPageData>

    const patch: Partial<AboutPageData> = {}
    if (typeof body.title === 'string') patch.title = body.title.trim()
    if (typeof body.lede === 'string') patch.lede = body.lede.trim()
    if (typeof body.story === 'string') patch.story = body.story.trim()
    if (typeof body.address === 'string') patch.address = body.address.trim()
    if (typeof body.email === 'string') patch.email = body.email.trim()
    if (typeof body.phone === 'string') patch.phone = body.phone.trim()

    if (patch.title !== undefined && patch.title.length === 0) {
      return NextResponse.json(
        { error: 'Page title cannot be empty.' },
        { status: 400 },
      )
    }

    const data = await updateAboutData(patch)
    revalidatePath('/about')
    revalidatePath('/', 'layout')
    return NextResponse.json({ data })
  } catch (err) {
    console.error('Update about page failed:', err)
    return NextResponse.json(
      { error: 'Failed to update About Us content.' },
      { status: 500 },
    )
  }
}

