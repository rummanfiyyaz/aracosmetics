import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getContactData, updateContactData } from '@/lib/db'
import type { ContactPageData } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await getContactData()
  return NextResponse.json({ data })
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<ContactPageData>

    const patch: Partial<ContactPageData> = {}
    if (typeof body.title === 'string') patch.title = body.title.trim()
    if (typeof body.lede === 'string') patch.lede = body.lede.trim()
    if (typeof body.content === 'string') patch.content = body.content.trim()
    if (typeof body.email === 'string') patch.email = body.email.trim()
    if (typeof body.phone === 'string') patch.phone = body.phone.trim()
    if (typeof body.hours === 'string') patch.hours = body.hours.trim()

    if (patch.title !== undefined && patch.title.length === 0) {
      return NextResponse.json(
        { error: 'Page title cannot be empty.' },
        { status: 400 },
      )
    }

    const data = await updateContactData(patch)
    revalidatePath('/contact')
    revalidatePath('/', 'layout')
    return NextResponse.json({ data })
  } catch (err) {
    console.error('Update contact page failed:', err)
    return NextResponse.json(
      { error: 'Failed to update Contact & Order Help content.' },
      { status: 500 },
    )
  }
}

