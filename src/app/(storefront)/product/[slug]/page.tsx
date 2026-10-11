import { notFound } from 'next/navigation'
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/db'
import { ProductDetailView } from '@/components/storefront/ProductDetailView'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()
  const [related, category] = await Promise.all([
    getRelatedProducts(product, 4),
    getCategoryBySlug(product.category),
  ])
  return (
    <ProductDetailView
      product={product}
      related={related}
      category={category}
    />
  )
}
