import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { HeroSlideshow } from '@/components/HeroSlideshow'
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
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="animate-[pfade_0.7s_ease]">
            <p className="text-[11px] uppercase tracking-[4px] text-gold">The Festive Edit · 2026</p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-foreground md:text-[64px]">
              Where tradition meets<br />
              <span className="text-wine">timeless beauty</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-foreground/70">
              Handcrafted sarees, kurtis and lehengas from India&apos;s finest weavers,               shipped, with love, anywhere in the world.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep"
              >
                Shop the Edit
              </Link>
              <Link
                href="/products/category/lehengas"
                className="rounded-full border border-foreground/20 px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-foreground transition hover:border-wine hover:text-wine"
              >
                Bridal Lehengas
              </Link>
            </div>
          </div>

          {/* Hero visual: clean full image on mobile, layered composition on desktop */}
          <div className="relative aspect-[4/5] w-full md:aspect-auto md:h-[520px]">
            {/* Image (fills on mobile; offset panel on desktop) */}
            <div className="absolute inset-0 overflow-hidden rounded-sm md:inset-auto md:right-0 md:top-0 md:h-[78%] md:w-[62%]">
              {heroImages.length > 0 ? (
                <HeroSlideshow images={heroImages} />
              ) : (
                <div className="h-full w-full" style={{ background: 'linear-gradient(150deg,#6e1f3b,#4a1228)' }} />
              )}
            </div>
            {/* Gold accent panel — desktop only */}
            <div
              className="absolute bottom-0 left-0 hidden h-[62%] w-[52%] rounded-sm border-8 border-background md:block"
              style={{ background: 'linear-gradient(150deg,#e8d7b8,#b68a3e)' }}
            />
            {/* Badge */}
            <div className="absolute bottom-4 right-4 rounded-sm bg-background/95 px-4 py-3 text-center shadow-sm md:bottom-6 md:right-6 md:px-5 md:py-4">
              <div className="font-display text-xl text-wine md:text-2xl">120+</div>
              <div className="text-[9px] uppercase tracking-[2px] text-muted md:text-[10px]">Master weaves</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Category strip ===== */}
      {categories.length > 0 && (
        <section className="border-y border-line bg-background">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4">
            {categories.map((c, i) => (
              <Link
                key={c.slug}
                href={`/products/category/${c.slug}`}
                className={`group flex flex-col items-center gap-1 border-line px-6 py-10 text-center transition hover:bg-gold-soft/30 ${
                  i % 2 === 0 ? 'border-r' : ''
                } ${i < 2 ? 'border-b md:border-b-0' : ''} md:[&:not(:last-child)]:border-r`}
              >
                <span className="font-display text-2xl text-foreground transition group-hover:text-wine">
                  {c.title}
                </span>
                {c.description && (
                  <span className="text-[11px] uppercase tracking-[2px] text-muted">{c.description}</span>
                )}
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
                {category.description && (
                  <p className="text-[11px] uppercase tracking-[4px] text-gold">{category.description}</p>
                )}
                <h2 className="mt-2 font-display text-4xl text-foreground">{category.title}</h2>
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
