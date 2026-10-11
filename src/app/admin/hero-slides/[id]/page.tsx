import { notFound } from 'next/navigation'
import { getHeroSlideById } from '@/lib/db'
import { HeroSlideForm } from '@/components/admin/HeroSlideForm'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string } }) {
  const existing = await getHeroSlideById(params.id)
  if (!existing) notFound()
  return <HeroSlideForm existing={existing} />
}
