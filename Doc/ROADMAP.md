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
- ✅ Cart (client state + localStorage; account-synced across devices)
- ✅ Checkout: contact + address autocomplete + country dropdown + payment
- ✅ Login required to order; orders linked to the customer; no duplicate draft orders
- ✅ Razorpay no-redirect popup checkout (Standard Checkout) + signature verify + webhook
- ✅ Country-based shipping (₹50 India / ₹2,500 international); charged in INR
- ✅ Orders collection + order detail page + downloadable single-page receipt; Pay-on-Delivery
- ❌ Stripe DROPPED — not available to Indian businesses (PayPal a future option for non-INR)

## Phase 3 — Global reach 🟡
- ⬜ Multi-language routing (next-intl / Payload localization) — localization enabled in config
- ✅ Multi-currency: INR base prices; geo-detected local display (`proxy.ts`) + currency switcher
  (static FX rates for now — wire a live FX feed later)
- ⬜ Localized SEO (hreflang, per-locale sitemaps)

## Phase 4 — SEO & polish 🟡
- ✅ Metadata API, Open Graph, structured data (Product JSON-LD, breadcrumbs)
- ✅ Dynamic sitemap.xml + robots.txt
- ✅ Real product imagery via Supabase Storage adapter (uploads to public `media` bucket)
- ✅ Google Analytics (gtag)
- ⬜ Organization/WebSite JSON-LD on home; Core Web Vitals + a11y pass

## Phase 5 — Accounts & extras 🟡
- ✅ Customer accounts (auth + email OTP verification); order history + detail + receipts
- ✅ Account-synced cart + wishlist across devices
- ✅ Email via Resend (OTP, contact notifications) — order-confirmation emails = future
- ✅ AI Listing Assistant (OpenAI) for products + auto alt-text on media uploads
- ⬜ Addresses management UI; password reset

## Current focus
Core store is **functional end-to-end** with live Razorpay (test keys), Supabase Storage,
multi-currency, and accounts. Next highest-value items:
1. Set **real ₹ product prices** + upload real product images in the admin.
2. Switch Razorpay to **live keys** + set the **webhook secret**; verify a domain in Resend.
3. Order-confirmation **emails**; Organization/WebSite **JSON-LD**; live **FX** feed.
4. **Currency switcher** + live FX; then multi-language (i18n).
