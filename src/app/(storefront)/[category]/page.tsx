import { notFound } from 'next/navigation'
import { getCategoryBySlug, getProductsByCategory } from '@/lib/db'
import { CategoryView } from '@/components/storefront/CategoryView'
import { RESERVED_SLUGS } from '@/data/categories'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: {
  params: { category: string }
}) {
  const slug = params.category
  if (RESERVED_SLUGS.has(slug)) notFound()

  const category = await getCategoryBySlug(slug)
  if (!category || category.hidden) notFound()

  const products = await getProductsByCategory(slug)
  return <CategoryView category={category} products={products} />
}
