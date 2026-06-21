# Payments

> **Razorpay only** (charges in INR). Stripe was dropped — it is not available to Indian
> businesses. PayPal is a likely future option for native non-INR checkout.

## Currency
- The store charges in **INR**. Product prices are stored in INR (base currency); the storefront
  shows each visitor's local currency, but checkout/charge is INR. See I18N.md.
- Shipping is flat per destination: **₹50 (India) / ₹2,500 (international)** — `lib/shipping.ts`.

## Flow (Razorpay Standard Checkout — no redirect)
1. Login is required to order; checkout is auth-gated and linked to the customer.
2. Server (`/api/checkout`) recomputes totals in INR, creates/updates a pending Order, and
   creates a Razorpay **order** (amount in paise). Reuses a pending "draft" order on retries.
3. Client opens the **Razorpay Checkout popup** over the site (no redirect).
4. On success, `/api/checkout/verify` verifies the signature (HMAC, timing-safe) and marks the
   order **paid**. Pay-on-Delivery places the order immediately (paid on delivery).
5. `POST /api/webhooks/razorpay` (verified with `RAZORPAY_WEBHOOK_SECRET`) is a second,
   independent confirmation. Never trust the client for payment status.

## Env
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (test keys set in dev;
  use live keys + webhook secret in Vercel for production).

## Security
- Never expose secret keys to the client (only publishable/key-id values).
- Always verify webhook signatures.
- Recompute order totals server-side; never trust client-sent prices.

## Open decisions
- ⬜ Exact country→provider routing rule
- ⬜ Refunds/cancellations handling
- ⬜ Tax/shipping calculation
