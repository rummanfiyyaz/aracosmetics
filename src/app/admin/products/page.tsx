import { listCategories, listProducts } from '@/lib/db'
import { ProductsTable } from '@/components/admin/ProductsTable'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ])
  return <ProductsTable products={products} categories={categories} />
}
