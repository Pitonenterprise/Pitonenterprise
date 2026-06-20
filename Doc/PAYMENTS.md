# Payments

> Two providers: Stripe (international) + Razorpay (India). Keep current as integration lands.

## Provider routing
- Default to **Stripe** for international customers (multi-currency cards, Apple/Google Pay).
- Use **Razorpay** for India (UPI, Indian cards, netbanking, INR).
- Selection: based on customer country / chosen currency at checkout (final logic TBD).

## Flow (both providers)
1. Customer reviews cart → checkout.
2. Server creates a payment intent/order with the chosen provider (amount in correct currency).
3. Client completes payment with the provider's SDK/checkout.
4. Provider calls our **webhook** on success/failure.
5. Webhook verifies signature → creates/updates the `Order` in Payload → triggers confirmation.

## Webhooks
- `POST /api/webhooks/stripe` — verify with `STRIPE_WEBHOOK_SECRET`.
- `POST /api/webhooks/razorpay` — verify with `RAZORPAY_WEBHOOK_SECRET`.
- Webhooks are the **source of truth** for order payment status (never trust the client).

## Security
- Never expose secret keys to the client (only publishable/key-id values).
- Always verify webhook signatures.
- Recompute order totals server-side; never trust client-sent prices.

## Open decisions
- ⬜ Exact country→provider routing rule
- ⬜ Refunds/cancellations handling
- ⬜ Tax/shipping calculation
