# Environment Variables

> Source of truth for config. Keep in sync with `.env.local.example`. Never commit real secrets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URI` | yes | Supabase Postgres connection string (pooled) used by Payload's Postgres adapter. |
| `PAYLOAD_SECRET` | yes | Secret used by Payload to sign/encrypt (auth tokens, etc.). |
| `NEXT_PUBLIC_SERVER_URL` | yes | Public base URL of the site (for canonical/SEO, callbacks). |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL (storage/client). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key (client-safe). |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase service role key (server-only; storage admin). |
| `STRIPE_SECRET_KEY` | yes | Stripe server secret key. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | Stripe publishable key (client). |
| `STRIPE_WEBHOOK_SECRET` | yes | Verifies Stripe webhook signatures. |
| `RAZORPAY_KEY_ID` | yes | Razorpay key id. |
| `RAZORPAY_KEY_SECRET` | yes | Razorpay secret (server-only). |
| `RAZORPAY_WEBHOOK_SECRET` | yes | Verifies Razorpay webhook signatures. |
| `RESEND_API_KEY` | no* | Resend API key for OTP verification + order emails. *Without it, OTP codes print to the server console (dev). Required for real email delivery. |
| `EMAIL_FROM` | no | Verified sender, e.g. `Piton Enterprise <onboarding@resend.dev>`. **Test mode** (using `onboarding@resend.dev`, no verified domain) only delivers to the Resend account owner's email. To email any customer, verify a domain at resend.com/domains and set this to an address on that domain. |
| `NEXT_PUBLIC_STORE_NAME` | no | Store branding (default: Pitonenterprise). |
| `OPENAI_API_KEY` | no | Only if the AI Saree Assistant chatbot is enabled later. |

## Notes
- `.env.local` is gitignored; only `.env.local.example` is committed (with placeholder values).
- Add a new row here whenever a new env var is introduced in code.
