import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/ProductGallery'
import { AddToCartButton } from '@/components/AddToCartButton'
import { WishlistButton } from '@/components/WishlistButton'
import { ProductCard } from '@/components/ProductCard'
import { getProductBySlug, getProducts } from '@/lib/queries'
import { formatPrice } from '@/lib/format'

export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  const desc = `${product.title}${product.fabric ? ` in ${product.fabric}` : ''}, handcrafted, shipped worldwide by Piton Enterprise.`
  return {
    title: product.title,
    description: desc,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.title,
      description: desc,
      images: product.image?.url ? [{ url: product.image.url }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = product.categorySlug
    ? (await getProducts({ categorySlug: product.categorySlug, limit: 4 })).products.filter(
        (p) => p.slug !== product.slug,
      )
    : []

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price

  // Product structured data (see Doc/SEO.md).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image?.url ? [product.image.url] : undefined,
    description: `${product.title}${product.fabric ? ` in ${product.fabric}` : ''}`,
    brand: { '@type': 'Brand', name: 'Piton Enterprise' },
    category: product.categoryTitle || undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-10 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-muted">
        <Link href="/" className="hover:text-wine">Home</Link>
        <span>/</span>
        {product.categorySlug && (
          <>
            <Link href={`/products/category/${product.categorySlug}`} className="hover:text-wine">
              {product.categoryTitle}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} accentColor={product.accentColor} title={product.title} />

        <div className="md:py-4">
          {product.categoryTitle && (
            <p className="text-[11px] uppercase tracking-[3px] text-gold">{product.categoryTitle}</p>
          )}
          <h1 className="mt-3 font-display text-4xl leading-tight text-foreground md:text-5xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl text-wine">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-base text-muted line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
            {product.badge && (
              <span className="bg-gold-soft/50 px-3 py-1 text-[10px] uppercase tracking-[2px] text-wine">
                {product.badge}
              </span>
            )}
          </div>

          <div className="mt-8">
            <AddToCartButton
              item={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.image?.url ?? null,
                accentColor: product.accentColor ?? null,
              }}
              sizes={product.sizes}
            />
          </div>

          <div className="mt-5 flex items-center gap-3 text-sm text-muted">
            <WishlistButton productId={product.id} className="!static opacity-100" />
            <span>Save to wishlist</span>
          </div>

          {/* Details */}
          <dl className="mt-10 space-y-3 border-t border-line pt-8 text-sm">
            {product.fabric && (
              <div className="flex gap-4">
                <dt className="w-32 uppercase tracking-[1.5px] text-muted">Fabric</dt>
                <dd className="text-foreground">{product.fabric}</dd>
              </div>
            )}
            {product.color && (
              <div className="flex gap-4">
                <dt className="w-32 uppercase tracking-[1.5px] text-muted">Colour</dt>
                <dd className="text-foreground">{product.color}</dd>
              </div>
            )}
            {product.occasions && product.occasions.length > 0 && (
              <div className="flex gap-4">
                <dt className="w-32 uppercase tracking-[1.5px] text-muted">Occasion</dt>
                <dd className="capitalize text-foreground">{product.occasions.join(', ')}</dd>
              </div>
            )}
            {product.careInstructions && (
              <div className="flex gap-4">
                <dt className="w-32 uppercase tracking-[1.5px] text-muted">Care</dt>
                <dd className="text-foreground">{product.careInstructions}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-display text-3xl text-foreground">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
