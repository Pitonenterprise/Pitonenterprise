import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductBuyArea } from '@/components/ProductBuyArea'
import { ProductCard } from '@/components/ProductCard'
import { getProductBySlug, getProducts } from '@/lib/queries'

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

  // Product structured data (see Doc/SEO.md).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image?.url ? [product.image.url] : undefined,
    description: `${product.title}${product.fabric ? ` in ${product.fabric}` : ''}`,
    sku: product.sku || undefined,
    brand: { '@type': 'Brand', name: 'Piton Enterprise' },
    category: product.categoryTitle || undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  // Breadcrumb structured data: Home › Category › Product.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      ...(product.categorySlug
        ? [{
            '@type': 'ListItem',
            position: 2,
            name: product.categoryTitle,
            item: `${siteUrl}/products/category/${product.categorySlug}`,
          }]
        : []),
      {
        '@type': 'ListItem',
        position: product.categorySlug ? 3 : 2,
        name: product.title,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-10 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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

      <ProductBuyArea
        product={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          badge: product.badge,
          categoryTitle: product.categoryTitle,
          accentColor: product.accentColor,
          image: product.image,
          images: product.images,
          colors: product.colors ?? [],
          sizes: product.sizes,
        }}
      >
        <div>
          {/* Description */}
          {typeof product.description === 'string' && product.description.trim() && (
            <div className="mt-10 space-y-4 border-t border-line pt-8 text-[15px] leading-[1.9] text-foreground/80">
              {product.description
                .split(/\n\n+|\n/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          )}

          {/* Details */}
          <dl className="mt-10 space-y-3 border-t border-line pt-8 text-sm">
            {product.sku && (
              <div className="flex gap-4">
                <dt className="w-32 uppercase tracking-[1.5px] text-muted">Product ID</dt>
                <dd className="text-foreground">{product.sku}</dd>
              </div>
            )}
            {product.fabric && (
              <div className="flex gap-4">
                <dt className="w-32 uppercase tracking-[1.5px] text-muted">Fabric</dt>
                <dd className="text-foreground">{product.fabric}</dd>
              </div>
            )}
            {product.color && (!product.colors || product.colors.length === 0) && (
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
      </ProductBuyArea>

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
