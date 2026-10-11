import { ContentPage } from '@/components/storefront/ContentPage'
import { formatPrice } from '@/lib/format'
import { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

export default function Page() {
  return (
    <ContentPage
      title="Shipping"
      lede="We ship worldwide from a single studio, with tracking on every order."
    >
      <p>
        Standard shipping is {formatPrice(FLAT_SHIPPING)}. Orders of{' '}
        {formatPrice(FREE_SHIPPING_THRESHOLD)} or more ship free.
      </p>
      <p>
        Paid orders leave within 1–2 business days. International delivery
        typically takes 5–10 business days depending on destination and
        customs.
      </p>
      <p>
        You will receive a tracking email as soon as the parcel is handed to
        the carrier.
      </p>
    </ContentPage>
  )
}
