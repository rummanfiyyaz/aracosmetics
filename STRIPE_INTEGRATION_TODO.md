# Stripe Integration TODO

## Values to Replace
The following values are configured in the integration. In Scenario A, existing real values were preserved. Review the table below before going live or if switching to Dashboard Price IDs.

**Files containing placeholders:**
- [src/app/api/checkout/session/route.ts](src/app/api/checkout/session/route.ts)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | `payment` | Set to `"payment"` for one-time charges or `"subscription"` for recurring billing. Configured for one-time payments. |
| line_items[].price | Dynamic `price_data` (from catalog) | Currently dynamically mapped from your database products (`unit_amount`, `currency`, `product_data`). If you prefer pre-created Stripe Price IDs from your Dashboard ([https://dashboard.stripe.com/prices](https://dashboard.stripe.com/prices)), replace with `{ price: "price_...", quantity: item.quantity }`. |

---

## Configured Parameters
These parameters were configured in Checkout Studio and are set in the codebase.

**Files containing these parameters:**
- [src/app/api/checkout/session/route.ts](src/app/api/checkout/session/route.ts)
- [src/lib/stripe.ts](src/lib/stripe.ts)
- [src/components/storefront/CheckoutPayment.tsx](src/components/storefront/CheckoutPayment.tsx)

| Parameter | Value |
|-----------|-------|
| `ui_mode` | `form` (Stripe SDK >= 21.0.0 installed: `^23.0.0`) |
| `billing_address_collection` | `auto` |
| `phone_number_collection` | `{ "enabled": false }` |
| `automatic_tax` | `{ "enabled": false }` |
| `submit_type` | `auto` |
| `integration_identifier` | `custom_embedded_web_0002` |
| `apiVersion` | `2026-03-25.dahlia; custom_checkout_payment_form_preview=v1` |
| Client Beta Flag | `custom_checkout_payment_form_1` |

---

## Setup and Next Steps

### 1. Setup Instructions & Environment Variables
Ensure the following environment variables are present in your `.env` (or production environment / Vercel):

- `STRIPE_SECRET_KEY`: Your Stripe secret or restricted key (`sk_live_...` or `rk_live_...`).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (`pk_live_...` or `pk_test_...`), accessible in the browser.
- `STRIPE_PUBLISHABLE_KEY`: Set to the same publishable key for server or script consistency.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret (`whsec_...`) from [https://dashboard.stripe.com/workbench/webhooks](https://dashboard.stripe.com/workbench/webhooks).

### 2. Project Structure
The Stripe integration files are organized as follows:
- `src/lib/stripe.ts`: Stripe SDK client initialization with the Dahlia preview API version (`2026-03-25.dahlia; custom_checkout_payment_form_preview=v1`).
- `src/app/layout.tsx`: Loads the required Stripe.js Dahlia build (`https://js.stripe.com/dahlia/stripe.js`) directly in the HTML `<head>`.
- `src/app/api/checkout/session/route.ts`: Server-side endpoint creating the Checkout Session with `ui_mode: 'form'` and returning `{ client_secret: session.client_secret }`.
- `src/app/api/create-checkout-session/route.ts`: Endpoint alias pointing to the Checkout Session handler.
- `src/components/storefront/CheckoutPayment.tsx`: Embedded Checkout form client component initializing `stripe.initCheckoutFormSdk({ clientSecret, appearance })`, mounting `#checkout-form`, and listening to the `confirm` event.
- `src/components/storefront/CheckoutView.tsx`: Storefront checkout view integrating the checkout session flow.
- `src/app/api/webhooks/stripe/route.ts`: Handles incoming Stripe webhook events (`checkout.session.completed`, etc.).

### 3. How the Integration Works (Flow Overview)
1. **Cart & Shipping**: The customer fills out contact and shipping details on the checkout page.
2. **Session Creation**: The client calls `POST /api/checkout/session` with the order items and customer info. The server creates an order in MongoDB and initiates a Stripe Checkout Session with `ui_mode: 'form'`.
3. **Embedded Form Rendering**: Stripe returns `client_secret`. The frontend initializes the Stripe Checkout Form SDK (`stripe.initCheckoutFormSdk(...)`) with the customized appearance and mounts the iframe into `<div id="checkout-form"></div>`.
4. **Payment & 3D Secure**: The user enters their payment details (supports all international cards, Link, wallets). Stripe handles Strong Customer Authentication (SCA) and 3D Secure inside the iframe or via redirect.
5. **Confirmation & Fulfillment**: When the payment completes, `checkout.session.completed` fires to your webhook handler (`/api/webhooks/stripe`), fulfilling the order and marking it as paid.

### 4. Testing Credit Cards & Test Modes
To test the checkout flow:
1. Switch `.env` keys to test keys (`sk_test_...` and `pk_test_...`).
2. Use Stripe's official test card numbers from [https://docs.stripe.com/testing](https://docs.stripe.com/testing):
   - **Successful charge**: `4242 4242 4242 4242`, any future MM/YY, any 3-digit CVC.
   - **3D Secure / SCA test card**: `4000 0027 6000 3184` (tests 3DS modal and international card verification).
   - **Decline tests**: `4000 0000 0000 0002` (generic decline), `4000 0000 0000 0069` (insufficient funds).

### 5. Next Steps
- Verify your webhook endpoint is active in [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/workbench/webhooks) pointing to `https://<your-domain>/api/webhooks/stripe` with event `checkout.session.completed`.
- Configure your Stripe Radar rules under [Radar > Rules](https://dashboard.stripe.com/radar/rules) to allow international and prepaid cards if desired.

### Resources
- [Stripe Support](https://support.stripe.com)
- [Stripe MCP Documentation](https://docs.stripe.com/mcp)
- [Stripe Checkout Embedded Form Guide](https://docs.stripe.com/checkout/embedded/quickstart)
