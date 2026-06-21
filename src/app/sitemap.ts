import type { MetadataRoute } from 'next'
import { getCategories, getProducts } from '@/lib/queries'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Generated fresh from the database on each request, so newly added products/categories
// appear automatically with no manual edits.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, { products }] = await Promise.all([
    getCategories(),
    getProducts({ limit: 5000 }),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE}/products/category/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
