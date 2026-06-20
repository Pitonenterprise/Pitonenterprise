# Roadmap & Progress

> Update the status checkboxes as work proceeds. Newest decisions reflected here.

Legend: ✅ done · 🟡 in progress · ⬜ not started

## Phase 0 — Foundation ✅
- ✅ Decide stack (see TECH_STACK.md)
- ✅ Set up `Doc/` living documentation
- ✅ Scaffold Next.js 16 + TypeScript + Tailwind v4
- ✅ Install & configure Payload CMS 3 with Supabase Postgres adapter (session pooler)
- ✅ Route groups `(frontend)` + `(payload)`; brand design tokens + fonts; first admin user
- ⬜ Add shadcn/ui (deferred — built bespoke components instead)
- ⬜ Resolve `payload generate:types` CLI issue (ERR_REQUIRE_ASYNC_MODULE on Node 20.20)

## Phase 1 — Catalog & CMS ✅
- ✅ Payload collections: Products, Categories, Media, Users, Customers, Orders + Settings
- ✅ Seed sample sarees/dresses (4 categories, 12 products via `/api/seed`)
- ✅ Storefront: home, product listing, product detail (ISR)
- ✅ Search; sort + pagination (price/color/fabric facet filters = future enhancement)

## Phase 2 — Commerce ✅
- ✅ Cart (client state + localStorage persistence)
- ✅ Checkout flow (contact + shipping + payment method)
- ✅ Stripe integration (international) + signature-verified webhook — gated on keys
- ✅ Razorpay integration (India) + signature-verified webhook — gated on keys
- ✅ Orders collection + order confirmation; Pay-on-Delivery works without keys
- ⬜ Client-side card confirmation UI (Stripe Elements / Razorpay Checkout) — needs keys to wire

## Phase 3 — Global reach 🟡
- ⬜ Multi-language routing (next-intl / Payload localization) — localization enabled in config
- 🟡 Multi-currency display + FX (format/convert utils built; needs a currency switcher + live FX)
- ⬜ Localized SEO (hreflang, per-locale sitemaps)

## Phase 4 — SEO & polish 🟡
- ✅ Metadata API, Open Graph, structured data (Product JSON-LD, breadcrumbs)
- ✅ Dynamic sitemap.xml + robots.txt
- ⬜ Organization/WebSite JSON-LD on home; Core Web Vitals + a11y pass
- ⬜ Real product imagery (Supabase Storage upload adapter) — currently gradient placeholders

## Phase 5 — Accounts & extras 🟡
- ✅ Customer accounts (auth), order history; wishlist (client-side)
- ⬜ Persist wishlist to the customer record; addresses management UI
- ⬜ Email (order confirmations, password reset) — needs an email adapter
- ⬜ (Optional) AI Saree Assistant chatbot — carried over from old codebase

## Current focus
Core store is **functional end-to-end**. Next highest-value items:
1. Add **real product images** (Supabase Storage adapter) to replace gradient placeholders.
2. Wire **payment keys** (Stripe/Razorpay) + client card confirmation UI.
3. Add an **email adapter** for order confirmations.
4. **Currency switcher** + live FX; then multi-language (i18n).
