import { ContentPage } from '@/components/storefront/ContentPage'

export default function Page() {
  return (
    <ContentPage
      title="Returns"
      lede="If it isn’t right, send it back within 30 days."
    >
      <p>
        Unused items in original packaging can be returned within 30 days of
        delivery for a refund to the original payment method.
      </p>
      <p>
        Opened cosmetics cannot be returned for hygiene reasons, unless the
        product is damaged or not as described.
      </p>
      <p>
        Email us with your order number and we will send a return label or
        prepaid instructions.
      </p>
    </ContentPage>
  )
}
