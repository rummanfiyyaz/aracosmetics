import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getReturnsData, updateReturnsData } from '@/lib/db'
import type { PolicyPageData } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await getReturnsData()
  return NextResponse.json({ data })
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<PolicyPageData>

    const patch: Partial<PolicyPageData> = {}
    if (typeof body.title === 'string') patch.title = body.title.trim()
    if (typeof body.lede === 'string') patch.lede = body.lede.trim()
    if (typeof body.content === 'string') patch.content = body.content.trim()

    if (patch.title !== undefined && patch.title.length === 0) {
      return NextResponse.json(
        { error: 'Page title cannot be empty.' },
        { status: 400 },
      )
    }

    const data = await updateReturnsData(patch)
    revalidatePath('/returns')
    revalidatePath('/', 'layout')
    return NextResponse.json({ data })
  } catch (err) {
    console.error('Update returns page failed:', err)
    return NextResponse.json(
      { error: 'Failed to update Returns content.' },
      { status: 500 },
    )
  }
}

