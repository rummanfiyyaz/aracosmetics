import { ContentPage } from '@/components/storefront/ContentPage'

export default function Page() {
  return (
    <ContentPage
      title="Privacy policy"
      lede="We collect only what we need to fulfill your order."
    >
      <p>
        When you check out we store your name, email, shipping address and
        order details so we can pack, ship and support the purchase.
      </p>
      <p>
        Card payments are processed by Stripe. We never store full card
        numbers on our servers.
      </p>
      <p>
        We do not sell personal data. Analytics or advertising pixels, if
        enabled, only measure store performance.
      </p>
    </ContentPage>
  )
}
