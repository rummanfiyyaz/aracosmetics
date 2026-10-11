import { ContentPage } from '@/components/storefront/ContentPage'

export default function Page() {
  return (
    <ContentPage
      title="Shipping"
      lede="We ship worldwide from a single studio, with tracking on every order."
    >
      <p>
        Free tracked shipping is included on all orders worldwide.
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
