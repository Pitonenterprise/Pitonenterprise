import type { MetadataRoute } from 'next'
import { getCategories, getProducts } from '@/lib/queries'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, { products }] = await Promise.all([
    getCategories(),
    getProducts({ limit: 1000 }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/products`, changeFrequency: 'daily', priority: 0.9 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE}/products/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/products/${p.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
