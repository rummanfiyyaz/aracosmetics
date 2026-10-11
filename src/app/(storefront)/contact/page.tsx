import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const settings = await getStoreSettings().catch(() => DEFAULT_STORE_SETTINGS)
  return (
    <ContentPage
      title="Contact"
      lede="Questions about an order, a formula, or shipping? We are here."
    >
      <p>
        Email us at{' '}
        <a
          href={`mailto:${settings.supportEmail}`}
          className="font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          {settings.supportEmail}
        </a>
        . Include your order number if you have one.
      </p>
      <p>
        We reply within one business day, Monday to Friday.
      </p>
    </ContentPage>
  )
}
