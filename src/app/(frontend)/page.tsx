import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { HeroBanner } from '@/components/HeroBanner'
import { getCategories, getFeaturedByCategory } from '@/lib/queries'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 120 // ISR, fast, SEO-friendly catalog pages

type Slide = { url: string; alt: string }

async function getHeroImages(): Promise<Slide[]> {
  try {
    const payload = await getPayloadClient()
    const settings: any = await payload.findGlobal({ slug: 'settings', depth: 1, overrideAccess: true })
    const rows: any[] = Array.isArray(settings?.heroImages) ? settings.heroImages : []
    const slides = rows
      .map((r) => r?.image)
      .filter((img) => img && typeof img === 'object' && img.url)
      .map((img) => ({ url: img.url as string, alt: (img.alt as string) || 'Piton Enterprise' }))
    if (slides.length) return slides
    // Fallback to the deprecated single hero image, if set.
    const single = settings?.heroImage
    if (single && typeof single === 'object' && single.url) {
      return [{ url: single.url, alt: single.alt || 'Piton Enterprise' }]
    }
  } catch {}
  return []
}

export default async function Home() {
  const [categories, sections, heroImages] = await Promise.all([
    getCategories(),
    getFeaturedByCategory(),
    getHeroImages(),
  ])

  return (
    <main>
      {/* ===== Hero banner (full-width horizontal carousel) ===== */}
      <HeroBanner images={heroImages} />

      {/* ===== Category strip ===== */}
      {categories.length > 0 && (
        <section className="border-y border-line bg-background">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 md:flex">
            {categories.map((c, i) => (
              <Link
                key={c.slug}
                href={`/products/category/${c.slug}`}
                className={`group flex flex-1 flex-col items-center gap-1 border-line px-6 py-10 text-center transition hover:bg-gold-soft/30 ${
                  i % 2 === 0 ? 'max-md:border-r' : ''
                } ${i < 2 ? 'max-md:border-b' : ''} ${i > 0 ? 'md:border-l' : ''}`}
              >
                <span className="font-display text-2xl text-foreground transition group-hover:text-wine">
                  {c.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Featured product sections per category ===== */}
      {sections.map(({ category, products }) => (
        <section key={category.slug} id={category.slug} className="scroll-mt-28">
          <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-4xl text-foreground">{category.title}</h2>
              </div>
              <Link
                href={`/products/category/${category.slug}`}
                className="hidden text-[12px] uppercase tracking-[1.5px] text-wine transition hover:text-wine-deep md:block"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===== Trust strip ===== */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-6 py-12 text-center md:grid-cols-3 md:px-8">
          {[
            { t: 'Worldwide Shipping', d: 'Delivered to 60+ countries' },
            { t: 'Artisan Crafted', d: 'Directly from master weavers' },
            { t: 'Easy 7-Day Returns', d: 'Shop with confidence' },
          ].map((x) => (
            <div key={x.t}>
              <h3 className="font-display text-xl text-wine">{x.t}</h3>
              <p className="mt-1 text-sm text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
