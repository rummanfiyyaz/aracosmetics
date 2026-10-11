import type { Metadata } from 'next'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => DEFAULT_STORE_SETTINGS)
  return { title: `${settings.name} Admin` }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getStoreSettings().catch(() => DEFAULT_STORE_SETTINGS)
  return (
    <AdminLayoutClient storeName={settings.name}>{children}</AdminLayoutClient>
  )
}
