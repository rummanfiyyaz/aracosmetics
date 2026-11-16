import { ContentPage } from '@/components/storefront/ContentPage'
import { DEFAULT_SHIPPING_DATA, getShippingData } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const shipping = await getShippingData().catch(() => DEFAULT_SHIPPING_DATA)

  const paragraphs = (shipping.content || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <ContentPage
      title={shipping.title || 'Shipping'}
      lede={shipping.lede || 'We ship worldwide from a single studio, with tracking on every order.'}
    >
      <div className="space-y-4">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </ContentPage>
  )
}
