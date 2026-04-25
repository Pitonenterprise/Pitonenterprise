# Aaranya Sarees — Ecommerce + AI Saree Assistant

A full-stack saree boutique built with **Next.js 16 (App Router) + TypeScript + Tailwind v4**, with a customer-facing **AI Saree Assistant** powered by **OpenAI GPT-4o-mini** that searches live inventory, answers fabric questions, and escalates to WhatsApp.

Runs out-of-the-box in **DEMO mode** with 12 seeded sarees and an in-memory data store — no Supabase needed to try it. Swap in Supabase + a payment processor for production.

---

## Quick start

```bash
npm install
cp .env.local.example .env.local      # already created with sane demo defaults
npm run dev
```

Open http://localhost:3000.

To enable the AI chatbot, add your Anthropic key to `.env.local`:

```
OPENAI_API_KEY=sk-ant-...
```

---

## What's in the box

| Surface | Path | Notes |
|---|---|---|
| Storefront homepage | `/` | Hero, featured + bridal grids, AI CTA |
| Product catalog | `/products` | Filters: category, fabric, occasion |
| Product detail | `/products/[slug]` | Image, specs, add-to-cart, related |
| Cart | `/cart` | Persisted via localStorage (zustand) |
| Checkout | `/checkout` | Form → `/api/checkout` → order created |
| Order success | `/checkout/success` | Order summary |
| Customer account | `/account` | Email lookup → order list |
| Order tracking | `/account/orders/[id]` | Status timeline + items |
| Admin dashboard | `/admin` | Stats, low-stock alerts, recent orders |
| Admin products | `/admin/products` | List, create, edit, delete |
| Admin orders | `/admin/orders` | List + status updates + tracking number |
| Admin chats | `/admin/chats` | Read every chat session transcript |
| About / Shipping / Returns | `/about` | Static content |

**API routes:** `/api/chat`, `/api/checkout`, `/api/orders`, `/api/admin/{login,logout,products,orders}`.

**Admin password (demo):** `admin123` — set via `ADMIN_PASSWORD` in `.env.local`.

---

## The AI Saree Assistant

Floating chat widget on every page. Powered by OpenAI GPT-4o-mini with a domain-specific system prompt and four tools:

- `search_products(category, fabric, color, occasion, min_price, max_price)` — live inventory search
- `get_product_details(product_id)` — full spec for a recommended saree
- `get_order_status(order_id, customer_email)` — order tracking with email verification
- `escalate_to_human(reason, conversation_summary)` — generates a pre-filled WhatsApp deep link

**Cost guards built in:**
- Hard cap of **30 messages per session** (auto-escalates after)
- Max **5 tool hops per turn** (prevents runaway tool loops)
- `gpt-4o-mini` model (cheap + fast — feels great in chat); override via `OPENAI_MODEL` env var

**Brand customization:** edit `src/lib/chat-prompt.ts` and `src/lib/config.ts`.

---

## Architecture

### Data layer
- **DEMO mode** (default): in-memory store at `src/lib/store.ts`, seeded from `src/data/seed-products.ts`. Survives within a single dev server process.
- **Production:** the public surface of `src/lib/store.ts` matches the schema in `db/schema.sql`. Swap each function for a Supabase query — no callsite needs to change.

### Cart
- `src/lib/cart-store.ts` — zustand store, persisted to `localStorage` so guests retain their cart.

### Currency
- `src/lib/currency.ts` — supports INR, USD, GBP, AED, CAD, AUD, SGD via static FX rates. Replace with a live API call (e.g. open.er-api.com) for production.

### Admin auth
- Cookie-gated layout (`src/app/admin/layout.tsx`) with a single password from env. Replace with Supabase Auth + role check for production.

---

## Going to production

1. **Provision Supabase** and run `db/schema.sql`.
2. Set `DEMO_MODE=false` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Replace functions in `src/lib/store.ts` with Supabase queries (the function signatures already match).
4. Wire **Razorpay** (India) or **Stripe** (international) into `src/app/checkout/page.tsx` + `src/app/api/checkout/route.ts`.
5. Replace email-lookup auth in `/account` with **Supabase Auth** (`@supabase/ssr` is already installed).
6. Replace cookie-password admin auth with role-based Supabase Auth.
7. Add **rate limiting** on `/api/chat` (10 messages/min per IP) and **chat session persistence** to the DB.
8. Set `NEXT_PUBLIC_STORE_NAME` and `NEXT_PUBLIC_STORE_WHATSAPP` to your real brand + WhatsApp number.

---

## Project layout

```
src/
  app/                       # Next.js routes
    api/                       # checkout, orders, chat, admin
    admin/                     # admin dashboard
    products/[slug]/           # product detail
    account/orders/[id]/       # order tracking
  components/                # ProductCard, AddToCartButton, ChatWidget, ProductForm…
  lib/
    config.ts                  # env vars
    store.ts                   # data store (demo) — swap for Supabase
    cart-store.ts              # client-side cart (zustand)
    currency.ts                # FX + price formatting
    chat-prompt.ts             # Saree Assistant system prompt + tool schemas
    chat-tools.ts              # server-side tool implementations
    admin-auth.ts              # cookie-based admin auth
  data/
    seed-products.ts           # 12 sample sarees
  types/                     # shared TS types
db/
  schema.sql                 # Postgres schema for Supabase
```

---

## Smoke tests

After `npm run dev`:

```bash
# Homepage
curl http://localhost:3000/ | grep "Aaranya"

# Place a test order
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","customer_email":"test@x.com",
       "shipping_address":{"line1":"1 St","city":"Mumbai","state":"MH",
       "postal_code":"400001","country":"India"},
       "items":[{"product_id":"p_003","quantity":1}]}'

# Look up by email
curl "http://localhost:3000/api/orders?email=test@x.com"

# Chat (requires OPENAI_API_KEY in .env.local)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Show me silk sarees under 20000"}'
```
