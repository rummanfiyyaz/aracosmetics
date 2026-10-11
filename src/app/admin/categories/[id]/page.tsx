import { notFound } from 'next/navigation'
import { getCategoryById } from '@/lib/db'
import { CategoryForm } from '@/components/admin/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: { id: string } }) {
  const existing = await getCategoryById(params.id)
  if (!existing) notFound()
  return <CategoryForm existing={existing} />
}
