import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getStoreSettings, updateStoreSettings } from '@/lib/db'
import type { StoreSettings } from '@/data/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ settings: await getStoreSettings() })
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<StoreSettings>

  const patch: Partial<StoreSettings> = {}
  if (typeof body.name === 'string') patch.name = body.name.trim()
  if (typeof body.tagline === 'string') patch.tagline = body.tagline.trim()
  if (typeof body.supportEmail === 'string')
    patch.supportEmail = body.supportEmail.trim()
  if (typeof body.currency === 'string') patch.currency = body.currency.trim()
  if (typeof body.description === 'string')
    patch.description = body.description.trim()

  if (patch.name !== undefined && patch.name.length === 0) {
    return NextResponse.json(
      { error: 'Store name cannot be empty.' },
      { status: 400 },
    )
  }

  const settings = await updateStoreSettings(patch)
  revalidatePath('/', 'layout')
  return NextResponse.json({ settings })
}
