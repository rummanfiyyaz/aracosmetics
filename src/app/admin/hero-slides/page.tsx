import { listHeroSlides } from '@/lib/db'
import { HeroSlidesTable } from '@/components/admin/HeroSlidesTable'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const slides = await listHeroSlides()
  return <HeroSlidesTable slides={slides} />
}
