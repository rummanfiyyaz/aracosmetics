import { listCategories } from '@/lib/db'
import { CategoriesTable } from '@/components/admin/CategoriesTable'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const categories = await listCategories()
  return <CategoriesTable categories={categories} />
}
