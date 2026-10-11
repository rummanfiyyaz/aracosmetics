import { listCategories } from '@/lib/db'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const categories = await listCategories()
  return <ProductForm categories={categories} />
}
