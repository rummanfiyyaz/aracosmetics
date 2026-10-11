import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import {
  DEFAULT_STORE_SETTINGS,
  getStoreSettings,
  listProducts,
  listVisibleCategories,
} from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [products, categories, settings] = await Promise.all([
    listProducts().catch((err) => {
      console.error('listProducts failed in StorefrontLayout', err)
      return []
    }),
    listVisibleCategories().catch((err) => {
      console.error('listVisibleCategories failed in StorefrontLayout', err)
      return []
    }),
    getStoreSettings().catch((err) => {
      console.error('getStoreSettings failed in StorefrontLayout', err)
      return DEFAULT_STORE_SETTINGS
    }),
  ])
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar
        products={products}
        categories={categories}
        storeName={settings.name}
      />
      <main className="flex-1">{children}</main>
      <Footer
        categories={categories}
        storeName={settings.name}
        description={settings.description}
      />
      <CartDrawer />
    </div>
  )
}
