# Architecture

> Keep this file in sync with the actual code. Update when structure or data flow changes.

## Overview

A single **Next.js (App Router)** application serves two surfaces from one deployment:

```
                       ┌─────────────────────────────────────────────┐
                       │              Next.js app (Vercel)            │
   Shoppers  ───────▶  │  Storefront  (SSR/SSG/ISR, SEO-optimized)   │
                       │     /  /products  /products/[slug]  /cart    │
                       │     /checkout  /account  ...                 │
                       │                                              │
   Admin/Staff ─────▶  │  Payload Admin  (/admin)                     │
                       │     products, orders, media, pages, users    │
                       └───────────────┬──────────────────────────────┘
                                       │  Payload Local API (server-side)
                                       ▼
                       ┌──────────────────────────────────────────────┐
                       │  Supabase Postgres  (data)                   │
                       │  Supabase Storage   (product images/media)   │
                       └──────────────────────────────────────────────┘

   Payments:   Stripe (international)  +  Razorpay (India)  via webhook callbacks
```

## Surfaces

### Storefront (public)
- Rendered with SSR/SSG/ISR for SEO and speed.
- Reads data through Payload's **Local API** (in-process, no HTTP hop) for product/category pages.
- Localized routes for multi-language; currency selected per visitor (see I18N.md).

### Admin (`/admin`)
- Provided by Payload CMS 3.
- Manages: Products, Categories, Orders, Media, Pages/Content, Users, Settings.
- Authenticated via Payload's built-in auth.

## Data flow (typical requests)

- **Browse products:** Storefront page → Payload Local API → Postgres → rendered HTML (cached/ISR).
- **Place order:** Checkout → create payment intent (Stripe/Razorpay) → on webhook success,
  create/confirm `Order` in Payload → confirmation email (later phase).
- **Admin edit:** Staff → Payload Admin UI → Payload → Postgres; storefront ISR revalidates.

## Directory structure (actual)

```
/                       repo root
├─ Doc/                 living documentation (this folder)
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/    public storefront — own root layout, globals.css, brand tokens
│  │  │   ├─ layout.tsx, page.tsx, globals.css
│  │  └─ (payload)/     Payload admin (/admin) + REST/GraphQL API routes
│  │      ├─ layout.tsx, custom.scss
│  │      ├─ admin/[[...segments]]/{page,not-found}.tsx, admin/importMap.js
│  │      └─ api/{[...slug],graphql,graphql-playground}/route.ts
│  ├─ collections/      Payload collection configs (Users, Media; Products/Categories next)
│  └─ payload.config.ts Payload configuration entry (@payload-config alias)
├─ public/              static assets
├─ next.config.ts       wrapped with withPayload()
├─ .env.local           secrets (gitignored)
└─ .env.local.example   placeholder template (committed)
```

> Two root layouts (one per route group) — there is intentionally NO `src/app/layout.tsx`,
> since the storefront and admin each provide their own `<html>`/`<body>`.
> Future: `components/` (shadcn/ui), `lib/` (payments, currency, seo helpers).

## Deployment

- **Vercel** for the Next.js app (storefront + admin).
- **Supabase** hosts Postgres + Storage.
- Payment webhooks point to `/api/webhooks/stripe` and `/api/webhooks/razorpay`.
