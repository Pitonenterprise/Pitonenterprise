import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SAMPLE_PRODUCTS, CATEGORIES } from '@/data/sample-products'

// Dev-only seeding endpoint. Idempotent: skips if products already exist (unless ?force=1).
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })
  const force = new URL(req.url).searchParams.get('force') === '1'

  const existing = await payload.find({ collection: 'products', limit: 0, overrideAccess: true })
  if (existing.totalDocs > 0 && !force) {
    return NextResponse.json({ skipped: true, message: 'Products already exist. Use ?force=1 to reseed.' })
  }

  if (force) {
    const all = await payload.find({ collection: 'products', limit: 500, overrideAccess: true })
    await Promise.all(all.docs.map((d) => payload.delete({ collection: 'products', id: d.id, overrideAccess: true })))
  }

  // Categories (idempotent by slug).
  const catIdBySlug: Record<string, string | number> = {}
  for (const [i, c] of CATEGORIES.entries()) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: c.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.docs[0]) {
      catIdBySlug[c.slug] = found.docs[0].id
    } else {
      const created = await payload.create({
        collection: 'categories',
        overrideAccess: true,
        data: { title: c.label, slug: c.slug, description: c.blurb, order: i },
      })
      catIdBySlug[c.slug] = created.id
    }
  }

  // Products.
  let createdCount = 0
  for (const p of SAMPLE_PRODUCTS) {
    await payload.create({
      collection: 'products',
      overrideAccess: true,
      data: {
        title: p.name,
        slug: p.slug,
        price: p.priceUsd,
        category: catIdBySlug[p.category],
        fabric: p.fabric,
        accentColor: p.swatch,
        badge: p.tag ?? undefined,
        stock: 12,
        status: 'active',
        featured: !!p.tag,
        sizes:
          p.category === 'sarees'
            ? []
            : ['XS', 'S', 'M', 'L', 'XL'].map((label) => ({ label, stock: 4 })),
      },
    })
    createdCount++
  }

  return NextResponse.json({
    ok: true,
    categories: Object.keys(catIdBySlug).length,
    products: createdCount,
  })
}
