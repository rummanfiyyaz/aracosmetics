import { ContentPage } from '@/components/storefront/ContentPage'

export default function Page() {
  return (
    <ContentPage
      title="Terms of service"
      lede="By placing an order you agree to these terms."
    >
      <p>
        Prices are shown in US dollars and are charged through Stripe at
        checkout. An order is confirmed only after payment succeeds.
      </p>
      <p>
        We may refuse or cancel an order if an item is out of stock, a
        payment fails, or we detect fraud. In those cases you will not be
        charged, or you will be refunded.
      </p>
      <p>
        Risk of loss passes to you when the carrier collects the parcel.
        Please inspect packages on arrival and contact us if something is
        missing or damaged.
      </p>
    </ContentPage>
  )
}