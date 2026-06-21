# Environment Variables

> Source of truth for config. Keep in sync with `.env.local.example`. Never commit real secrets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URI` | yes | Supabase Postgres connection string. Use the **transaction pooler (port 6543)** — the session pooler (5432) caps at 15 clients and exhausts during builds. |
| `PAYLOAD_SECRET` | yes | Secret used by Payload to sign/encrypt (auth tokens, etc.). |
| `NEXT_PUBLIC_SERVER_URL` | yes | Public base URL of the site (for canonical/SEO, callbacks). |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL. Also powers the Storage upload adapter + image URLs. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key (client-safe). |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase service role key (server-only). Used by the **Storage upload adapter** (uploads to the public `media` bucket). |
| `SUPABASE_BUCKET` | no | Storage bucket name (default `media`). |
| `RAZORPAY_KEY_ID` | for payments | Razorpay key id (`rzp_test_…` / `rzp_live_…`). Without it, only Pay-on-Delivery is offered. |
| `RAZORPAY_KEY_SECRET` | for payments | Razorpay secret (server-only). |
| `RAZORPAY_WEBHOOK_SECRET` | no | Verifies Razorpay webhook signatures (set when the webhook is configured). |
| `RESEND_API_KEY` | no* | Resend API key for OTP + emails. *Without it, OTP codes print to the server console (dev). |
| `EMAIL_FROM` | no | Verified sender. `onboarding@resend.dev` only delivers to the Resend owner's email; verify a domain (e.g. `noreply@pitonenterprise.com`) to email any customer. |
| `OPENAI_API_KEY` | no | Powers the AI Listing Assistant + auto alt-text. Without it those features return a friendly "not configured" message. |
| `OPENAI_MODEL` | no | Defaults to `gpt-4o-mini` (vision-capable). |
| `GEOAPIFY_API_KEY` | no | Upgrades checkout address autocomplete from keyless Photon/OSM to Geoapify. |
| `NEXT_PUBLIC_GA_ID` | no | Google Analytics Measurement ID (defaults to `G-9QLHH69HD3`). |
| `NEXT_PUBLIC_STORE_NAME` | no | Store branding (default: Piton Enterprise). |

> **Stripe removed** — not available to Indian businesses. (`STRIPE_*` vars are no longer used.)

## Notes
- `.env.local` is gitignored; only `.env.local.example` is committed (with placeholder values).
- Add a new row here whenever a new env var is introduced in code.
