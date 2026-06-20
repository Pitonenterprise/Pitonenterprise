# Data Model (Payload Collections)

> The schema lives in Payload collection configs under `src/collections/`. This file is the
> human-readable mirror — update it whenever a collection or field changes.

## Collections (planned)

### Products
- `title` (localized), `slug` (unique), `description` (localized, rich text)
- `images` (relation → Media, multiple), `priceBase` (number, in base currency)
- `category` (relation → Categories), `tags`
- Attributes: `fabric`, `color`, `occasion`, `pattern`
- `variants` (size/color → SKU, stock, optional price override)
- `stock` (number), `status` (draft/active/archived)
- SEO group: `metaTitle`, `metaDescription`, `ogImage`

### Categories
- `title` (localized), `slug`, `description` (localized), `image`, `parent` (self-relation)
- SEO group (metaTitle/metaDescription)

### Media
- Uploaded product images/assets (stored in Supabase Storage / Vercel Blob)
- Alt text (localized) for accessibility + SEO

### Orders
- `orderNumber`, `customer` (relation → Customers/Users or guest fields)
- `items` (product, variant, qty, unit price snapshot)
- `currency`, `subtotal`, `shipping`, `tax`, `total`
- `paymentProvider` (stripe/razorpay), `paymentStatus`, `providerRef`
- `shippingAddress`, `billingAddress`, `fulfillmentStatus`

### Customers / Users
- Payload auth users for **admin/staff**.
- Customer accounts (later phase): email, name, addresses, order history, wishlist.

### Settings (global)
- Store name, logo, contact, social links, supported currencies/languages, shipping rules.

## Conventions
- Base currency stored on products (proposed USD); display conversion at render time.
- Localized fields use Payload localization for translated content.
- Slugs are unique and URL-safe; used directly in storefront routes.

> STATUS: **Implemented** (2026-06-20). Collections live in `src/collections/*` and the
> `Settings` global in `src/globals/Settings.ts`. Differences from the original plan:
> - Products use a `status` field (active / oos / archived) instead of Payload drafts
>   (drafts' `_status` enum collided with our `status` enum on Postgres).
> - Products carry an `accentColor` gradient fallback used until real images are uploaded.
> - `slug`, `seo` are reusable fields (`src/fields/`). Access control in `src/access/`.
> - Storefront reads go through `src/lib/queries.ts` (mapped to decoupled `StoreProduct`/
>   `StoreCategory` shapes), not the generated payload types.
