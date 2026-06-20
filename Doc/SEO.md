# SEO Strategy

> SEO is the #1 priority for this project. Keep this file current as SEO features land.

## Principles
- Server-render everything indexable (SSR/SSG/ISR) — no client-only product content.
- Fast Core Web Vitals (good LCP/CLS/INP) — image optimization, minimal JS.
- Clean, semantic, accessible HTML.

## Per-page metadata
- Use Next.js **Metadata API** (`generateMetadata`) on every route.
- Unique `<title>` and meta description per product, category, and page.
- Canonical URLs; `hreflang` alternates for each language (see I18N.md).
- Open Graph + Twitter cards for rich social sharing (product image, price).

## Structured data (JSON-LD)
- **Product** schema: name, image, description, brand, offers (price, currency, availability).
- **BreadcrumbList** on product/category pages.
- **Organization** + **WebSite** (with SearchAction) on the homepage.
- **AggregateRating / Review** once reviews exist.

## Crawlability
- Dynamic **`sitemap.xml`** generated from products/categories (per-locale sitemaps).
- **`robots.txt`** allowing crawl, pointing to sitemaps.
- Logical URL structure: `/products/[slug]`, `/c/[category]`, locale-prefixed (`/en`, `/fr`, ...).
- Avoid duplicate content: canonicals + consistent trailing-slash policy.

## Performance for SEO
- `next/image` with proper sizes, AVIF/WebP, lazy loading below the fold.
- Font optimization with `next/font`.
- ISR/caching for catalog pages; minimal client JS on product pages.

## Content
- Rich, keyword-relevant product descriptions (managed in Payload).
- Category landing pages with descriptive copy.
- Blog/lookbook (optional, later) for long-tail keywords.

## Checklist (track here)
- ⬜ Metadata API on all routes
- ⬜ JSON-LD: Product, Breadcrumb, Organization, WebSite
- ⬜ Dynamic sitemap.xml + robots.txt
- ⬜ hreflang alternates
- ⬜ Core Web Vitals pass
