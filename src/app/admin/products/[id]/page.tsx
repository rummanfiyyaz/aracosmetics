import { notFound } from 'next/navigation'
import { getProductById, listCategories } from '@/lib/db'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string } }) {
  const [existing, categories] = await Promise.all([
    getProductById(params.id),
    listCategories(),
  ])
  if (!existing) notFound()
  return <ProductForm existing={existing} categories={categories} />
}
