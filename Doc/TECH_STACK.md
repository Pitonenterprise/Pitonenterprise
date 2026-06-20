# Tech Stack & Decisions

> Status: **Confirmed** (2026-06-19). Update this file whenever a stack decision changes.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router) + TypeScript** | Best SEO (SSR/SSG/ISR, metadata API, sitemaps, structured data), huge ecosystem, great UI flexibility. |
| Styling / UI | **Tailwind CSS + shadcn/ui** | Fast to build a premium, consistent, accessible UI. Easy to theme for a fashion brand. |
| Admin / CMS | **Payload CMS 3** | Installs *inside* the Next.js app (single codebase + single deploy). Polished admin for products, orders, media, and content. Far less work than a custom admin, fully customizable in code. |
| Database | **Supabase (Postgres)** | Managed Postgres with generous free tier. Used via Payload's `@payloadcms/db-postgres` adapter (Supabase is standard Postgres + a pooled connection string). |
| Media / images | **Supabase Storage** (or Vercel Blob) | Store product images; serve via Next.js `<Image>` for optimization. Decision finalized in DATA_MODEL/ENV. |
| Payments | **Stripe + Razorpay** | Stripe for international cards/wallets & multi-currency; Razorpay for India (UPI, Indian cards, netbanking). |
| Internationalization | **next-intl** (or Payload localization) | Multi-language routing + translated content. Multi-currency via FX conversion + per-locale formatting. See I18N.md. |
| Hosting | **Vercel** | First-class Next.js support, edge network for global speed (good for SEO). |
| Email | TBD (Resend / Supabase) | Order confirmations, password resets. To be decided in a later phase. |

## Key architectural principle

**One Next.js app** hosts both the **storefront** (public, SEO-optimized) and the **Payload admin**
(`/admin`). Payload's local API is used server-side for fast, type-safe data access in storefront
pages — no separate backend service to deploy.

## Notable carry-overs from the old codebase

- The previous version had an **OpenAI "AI Saree Assistant" chatbot**. Logged as a possible
  future feature (see ROADMAP.md), not part of the initial build.
- Supabase was already the intended database — we continue with it.
