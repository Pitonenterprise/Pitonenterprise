# Changelog

> Running log of notable changes, newest first. Update with every meaningful change.

## 2026-06-20 (checkout, orders, receipts, product IDs, polish)
- **Login required to order.** `/api/checkout` rejects guests (`401 login_required`) and links
  the order to the customer; checkout page checks auth, prefills from the account, and redirects
  guests to login (`?redirect=/checkout`).
- **No duplicate orders.** Checkout reuses the customer's pending "draft" order across payment
  attempts (e.g. Razorpay abandoned → COD) instead of creating a new one.
- **Country-based shipping in INR:** flat ₹50 (India) / ₹2,500 (international), `lib/shipping.ts`.
  Checkout computes everything in INR; shows the visitor's currency with a small "charged in
  INR" note.
- **Product ID (SKU):** `Products.sku` (unique, auto-assigned `PE-00001` on create, editable);
  shown in admin list + on the product page. Existing products backfilled.
- **Order detail page** `/account/orders/[orderNumber]` with friendly status (`lib/orderStatus.ts`:
  "Order confirmed", "Pay on delivery", stepper Confirmed→Shipped→Delivered) and a
  **downloadable single-page receipt** (`/api/orders/[orderNumber]/receipt`, standalone HTML
  with product IDs, totals, address; auto-opens print/Save-as-PDF).
- **Address autocomplete** at checkout (`/api/address/suggest`): keyless Photon/OSM by default,
  upgrades to Geoapify if `GEOAPIFY_API_KEY` is set. Plus a **country dropdown** (`data/countries.ts`).
- **Google Analytics** (gtag `G-9QLHH69HD3`) on storefront pages via `next/script`; admin untracked.
- **Settings.heroImages** array → homepage **hero slideshow** (`HeroSlideshow`, crossfade every 2s).
- Content tweaks: removed footer "Size Guide", About "Manufacturing Unit"/"Retail Shop" stats,
  receipt letterhead + button icon; hero headline → "Where tradition meets timeless beauty".

## 2026-06-20 (keep-alive)
- Added `/api/health` (force-dynamic; does a 1-row DB read) and a daily GitHub Action
  (`.github/workflows/keep-alive.yml`, cron 03:30 UTC = 09:00 IST) that pings it so the
  free Supabase project never pauses (~7-day inactivity sleep). No secrets required.

## 2026-06-20 (content pages)
- Added **About / Our Story** page (`/about`) — founded 2006, grew from 1 employee to 50
  artisans, own manufacturing unit + retail shop, ships worldwide. SEO metadata + stats strip.
- Added **Contact Us** (`/contact`): form saves to a new `messages` collection (admin-managed)
  and sends a best-effort notification email to the store (`supportEmail` from Settings, else
  fallback). Page shows email/WhatsApp/shop/hours.

## 2026-06-20 (account-synced cart + wishlist)
- Cart + wishlist now follow the customer across devices. `Customers` gained a `cart` array
  (alongside the existing `wishlist` relationship). `/api/account/cart` GET/PUT (auth-guarded)
  load/save it. `StoreProvider` detects an active session, merges the guest/browser cart with
  the account cart on login (union, higher quantity per line), autosaves on change (debounced),
  and clears local state on logout (data is preserved in the account). Tested via API.

## 2026-06-20 (email OTP verification)
- **Added email OTP verification for customer signup** (was previously instant/no verification).
  - `Customers`: new `isVerified` + hidden OTP fields (`otpHash`, `otpExpiresAt`, `otpAttempts`);
    `beforeLogin` hook blocks sign-in until verified (throws `ACCOUNT_NOT_VERIFIED`).
  - `lib/otp.ts`: 6-digit code, HMAC-SHA256 hash (bound to email), 10-min TTL, 5-attempt cap,
    constant-time compare. `lib/email.ts`: Resend HTTP API sender with console fallback.
  - Routes: `/api/auth/register` (create + send code), `/verify-otp`, `/resend-otp`.
  - Frontend: register → `/account/verify` (6-box OTP, paste, resend w/ cooldown) → login.
    Login routes unverified users back to the OTP screen.
  - Env: `RESEND_API_KEY`, `EMAIL_FROM`. Until a key is set, codes print to the server console.
  - Tested end-to-end (console mode): register→code, login blocked (403) pre-verify, verify→200,
    login→200 post-verify. Production build passes.

## 2026-06-20 (e-commerce core)
- **Built the full e-commerce core** (Phases 1–4). Production build passes (26 routes).
- **Data model** (`src/collections`): `Products` (price, compareAtPrice, images, sizes/variants,
  stock, attributes, badge, accentColor, SEO, status), `Categories`, `Customers` (auth + addresses
  + wishlist), `Orders` (items snapshot, totals, payment/fulfillment status, addresses) + `Settings`
  global (shipping, tax, currencies, socials). Reusable `slugField`, `seoField`, access helpers.
  - Dropped Payload `drafts` on Products/Categories — its `_status` enum collided with our custom
    `status` field (`enum_products_status` "active" rejected). Using `status` (active/oos/archived).
- **DB tuning:** Supabase **session pooler (5432)** capped at pool_size 15; set Payload pool
  `max: 8` + `idleTimeoutMillis`, and **`push: false`** (schema already synced) to stop per-init
  introspection exhausting connections. To change schema later: temporarily `push: true` + restart.
- **Data layer** (`src/lib`): cached `getPayloadClient` (do NOT cache under global `_payload` —
  Payload reserves it), `queries.ts` (categories/products/by-slug/by-ids/search/featured),
  `format.ts` (multi-currency FX + `Intl` formatting). Seeded 4 categories + 12 products via
  guarded dev route `/api/seed`.
- **Storefront (live data):** home (hero + category strip + featured sections), `/products`
  (sort + pagination), `/products/category/[slug]` (SSG params), `/products/[slug]` (gallery,
  add-to-cart with sizes, attributes, related, **Product JSON-LD**), `/search`.
- **Cart + Wishlist:** client `StoreProvider` (localStorage persistence), cart badge, add-to-cart,
  wishlist toggle, `/cart` and `/wishlist` pages.
- **Checkout + payments:** `/api/checkout` recomputes prices server-side, creates an `Order`,
  initializes the gateway. **Stripe + Razorpay** integrations + signature-verified webhooks,
  **gated on env keys**; **Pay-on-Delivery** works today (tested end-to-end → order PE-2886).
- **Customer accounts:** register / login / logout, `/account` dashboard with order history.
- **SEO:** per-page metadata + canonicals, dynamic `sitemap.xml` (18 URLs) + `robots.txt`.

## 2026-06-20 (INR base + multi-currency display)
- **Base currency is now INR** — admin enters rupee prices (Products.price label updated).
- Storefront shows each visitor's **local currency**, converted from INR. A `proxy.ts`
  (renamed from the deprecated `middleware.ts`) maps the Vercel geo header
  `x-vercel-ip-country` to a currency and stores it in a `pe_currency` cookie; a
  `CurrencyProvider` + `<Price>` component format prices client-side, and a header
  `CurrencySwitcher` lets visitors override.
- `lib/format.ts` reworked to INR base (`FX_FROM_INR`, `formatMoney`, `currencyForCountry`).
- Checkout + orders are INR throughout; product JSON-LD priceCurrency is INR.
- NOTE: existing sample product prices (e.g. 189) now read as ₹189 — set real INR prices in
  the admin (or bulk-adjust).

## 2026-06-20 (Razorpay checkout; Stripe dropped)
- Built the no-redirect Razorpay popup checkout (Standard Checkout / Checkout.js). The modal
  opens over the storefront; the customer never leaves the site.
  - `/api/checkout` creates the Razorpay order (now correctly converts the USD total to INR
    paise — previous code under-charged by sending USD as INR).
  - `/api/checkout/verify` verifies the payment signature (HMAC, timing-safe) and marks the
    order paid; the Razorpay webhook remains a second confirmation.
  - Checkout page loads Checkout.js, opens the modal, verifies, then shows the confirmation.
  - **Stripe removed** — not available to Indian businesses. Razorpay accepts all countries
    (charged in INR). PayPal is the likely future option for native international currency.
  - Needs `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.

## 2026-06-20 (Supabase Storage for uploads)
- Fixed 500 on image uploads on the live site. Vercel's filesystem is read-only, so Payload's
  default local-disk uploads fail in production. Added a custom Payload cloud-storage adapter
  (`src/lib/supabaseStorageAdapter.ts`) that uploads to a **public Supabase Storage bucket**
  (`media`) via the REST API + the existing service-role key — no separate S3 keys needed.
  Images (and all resized sizes) now serve from Supabase's public CDN.
  - Enabled automatically when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set
    (both already in Vercel from before), so production works after deploy with no new env vars.
  - Optional `SUPABASE_BUCKET` (defaults to `media`).

## 2026-06-20 (AI refinements + DB pooler)
- AI image reads now load the file from disk (Payload upload dir) instead of an unreliable
  loopback HTTP fetch — fixes "fetch failed" when generating from an uploaded image.
- AI prompt now always extracts a specific primary colour and fabric from the image; added a
  deterministic occasions fallback (infer from the copy). Attributes section opens by default.
- Switched `DATABASE_URI` to the Supabase **transaction pooler (port 6543)**. Session mode
  (5432) caps clients at 15 and was exhausted during builds (EMAXCONNSESSION) and serverless
  runtime. 6543 multiplexes connections; build now runs with 7 parallel workers. **Action:
  update DATABASE_URI to port 6543 in Vercel too.**

## 2026-06-20 (AI listing assistant)
- Added an **AI Listing Assistant** to the Payload product editor. Staff upload an image and/or
  type rough notes, click "Generate with AI", and OpenAI writes an SEO-optimized title,
  description (Lexical rich text), meta title/description, attributes (fabric, colour, occasions,
  pattern, badge) and suggested keywords, then auto-fills the form for review before saving.
  - `src/lib/ai.ts` (provider-isolated OpenAI vision+text generator), admin-guarded route
    `/api/ai/generate-product` (resolves the uploaded image to a base64 data URL), and a custom
    admin UI field `src/admin/AIProductAssistant.tsx`.
  - Requires `OPENAI_API_KEY` (optional `OPENAI_MODEL`, default `gpt-4o-mini`). Add it in Vercel
    for production.

## 2026-06-20 (later)
- **Implemented the "Piton Enterprise" design** from the Claude Design project
  (`claude_design` MCP, project "Women's saree and dress site"). The source `.dc.html`
  specified the announcement bar + sticky header; extended the homepage, footer, and product
  cards in the same visual language.
  - Design tokens (`globals.css`): cream `#F7F1E8`, ink `#2A2320`, wine `#6E1F3B`, deep wine
    `#4A1228`, gold `#B68A3E`, soft gold `#E8D7B8`. Fonts: Marcellus (display) + Jost (body).
  - New components: `Header` (announcement bar, sticky blur nav Home/Sarees/Kurtis/Lehengas/
    Western, centered logo, search/account/wishlist/cart icons), `Footer` (newsletter + link
    columns), `ProductCard`.
  - Homepage: hero, category strip, per-category featured sections (`#sarees` … `#western`
    anchors), trust strip. Uses temporary `src/data/sample-products.ts` (brand-gradient image
    placeholders) until the Payload `Products` catalog lands in Phase 1.

## 2026-06-20
- **Phase 0 scaffold complete.** Created a Next.js 16 + React 19 + TypeScript app with
  Tailwind CSS v4. Integrated **Payload CMS 3.85** directly inside it:
  - Split routes into `src/app/(frontend)` (storefront, own root layout + brand tokens/fonts)
    and `src/app/(payload)` (admin at `/admin` + REST/GraphQL APIs).
  - Added `src/payload.config.ts` with the Postgres adapter (Supabase **session pooler**,
    port 5432), Lexical rich-text editor, and localization (`en`, `hi`).
  - Base collections: `Users` (auth) and `Media` (uploads with image sizes + localized alt).
  - Wired `withPayload` in `next.config.ts`, added `@payload-config` tsconfig alias and
    Payload npm scripts.
  - Booted dev server → Payload auto-synced its schema into the empty Supabase DB (users,
    media, sessions, preferences, migrations, etc.). Verified storefront + `/admin` render.
  - Created the first admin user (`pitonenterprise3240@gmail.com`) — temp password, must change.
  - KNOWN ISSUE: `payload generate:types` / `generate:importmap` CLI fail on Node 20.20 with
    `ERR_REQUIRE_ASYNC_MODULE` (ESM/TLA). Non-blocking (dev bundler loads the config fine);
    to resolve later. `payload-types.ts` not yet generated.

## 2026-06-19
- Connected directly to Supabase Postgres (transaction pooler, region aws-1-us-east-1) and
  **dropped ALL old tables** (`chat_messages`, `chat_sessions`, `orders`, `products`, `wishlists`).
  `public` schema is now empty — clean slate for Payload. `DATABASE_URI` + a generated
  `PAYLOAD_SECRET` saved to `.env.local`.
- Wired Supabase: saved anon + service_role keys to `.env.local` (gitignored); verified the
  project (`htxnycxfsbnoegfyvqhw`) is reachable and keys work. Recreated `.gitignore` so secrets
  are never committed.
- Discovered the Supabase project held the OLD app's data: `products` (2 sample sarees,
  snake_case schema, images in `product-images` storage bucket) and `orders`.
- **Wiped Supabase clean** per request: deleted both storage files, deleted the `product-images`
  bucket, and deleted all rows from `products` and `orders`. Verified empty (no buckets, no rows).
  The empty old table *definitions* still exist; they'll be dropped when Payload runs its schema
  migration (needs the DB password / `DATABASE_URI`).
- Cleared the old codebase to start fresh (kept `.env.local.example` and git history).
- Confirmed stack: Next.js (App Router) + TS, Tailwind + shadcn/ui, Payload CMS 3,
  Supabase Postgres, Stripe + Razorpay, multi-language + multi-currency, Vercel hosting.
- Created the `Doc/` living documentation set: README, ARCHITECTURE, TECH_STACK, DATA_MODEL,
  SEO, I18N, PAYMENTS, ENV, ROADMAP, CHANGELOG.
