import { cache } from 'react'
import { getPayloadClient } from './payload'

// Storefront-facing shapes (decoupled from generated payload-types).
export type StoreImage = { url: string; alt: string } | null

export type StoreProduct = {
  id: string | number
  title: string
  slug: string
  price: number
  compareAtPrice?: number | null
  fabric?: string | null
  color?: string | null
  badge?: string | null
  accentColor?: string | null
  stock: number
  sizes: { label: string; stock: number }[]
  categorySlug?: string | null
  categoryTitle?: string | null
  image: StoreImage
  images: StoreImage[]
  description?: unknown
  occasions?: string[]
  careInstructions?: string | null
}

export type StoreCategory = {
  id: string | number
  title: string
  slug: string
  description?: string | null
  accentColor?: string | null
  image: StoreImage
}

function toImage(img: unknown): StoreImage {
  if (img && typeof img === 'object' && 'url' in img) {
    const m = img as { url?: string; alt?: string }
    if (m.url) return { url: m.url, alt: m.alt || '' }
  }
  return null
}

function mapProduct(doc: Record<string, any>): StoreProduct {
  const images: StoreImage[] = Array.isArray(doc.images)
    ? doc.images.map((row: any) => toImage(row?.image)).filter(Boolean)
    : []
  const category = typeof doc.category === 'object' ? doc.category : null
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    price: doc.price ?? 0,
    compareAtPrice: doc.compareAtPrice ?? null,
    fabric: doc.fabric ?? null,
    color: doc.color ?? null,
    badge: doc.badge ?? null,
    accentColor: doc.accentColor ?? null,
    stock: doc.stock ?? 0,
    sizes: Array.isArray(doc.sizes)
      ? doc.sizes.map((s: any) => ({ label: s.label, stock: s.stock ?? 0 }))
      : [],
    categorySlug: category?.slug ?? null,
    categoryTitle: category?.title ?? null,
    image: images[0] ?? null,
    images,
    description: doc.description ?? null,
    occasions: doc.occasions ?? [],
    careInstructions: doc.careInstructions ?? null,
  }
}

function mapCategory(doc: Record<string, any>): StoreCategory {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description ?? null,
    accentColor: doc.accentColor ?? null,
    image: toImage(doc.image),
  }
}

// cache() dedupes identical calls within a single request (e.g. generateMetadata
// + the page component) so each page hits the DB once, not 2-3×.
export const getCategories = cache(async (): Promise<StoreCategory[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'categories',
    sort: 'order',
    limit: 50,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs.map(mapCategory)
})

export const getCategoryBySlug = cache(async (slug: string): Promise<StoreCategory | null> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return res.docs[0] ? mapCategory(res.docs[0]) : null
})

type ProductQuery = {
  categorySlug?: string
  search?: string
  sort?: 'newest' | 'price-asc' | 'price-desc'
  limit?: number
  page?: number
}

const SORT_MAP: Record<string, string> = {
  newest: '-createdAt',
  'price-asc': 'price',
  'price-desc': '-price',
}

export async function getProducts(q: ProductQuery = {}): Promise<{
  products: StoreProduct[]
  totalPages: number
  page: number
  totalDocs: number
}> {
  const payload = await getPayloadClient()
  const where: Record<string, any> = { status: { equals: 'active' } }
  if (q.categorySlug) where['category.slug'] = { equals: q.categorySlug }
  if (q.search) where.title = { like: q.search }

  const res = await payload.find({
    collection: 'products',
    where,
    sort: SORT_MAP[q.sort ?? 'newest'] ?? '-createdAt',
    limit: q.limit ?? 24,
    page: q.page ?? 1,
    depth: 1,
    overrideAccess: true,
  })
  return {
    products: res.docs.map(mapProduct),
    totalPages: res.totalPages,
    page: res.page ?? 1,
    totalDocs: res.totalDocs,
  }
}

export const getProductBySlug = cache(async (slug: string): Promise<StoreProduct | null> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })
  return res.docs[0] ? mapProduct(res.docs[0]) : null
})

export async function getProductsByIds(ids: (string | number)[]): Promise<StoreProduct[]> {
  if (ids.length === 0) return []
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { id: { in: ids } },
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })
  const map = new Map(res.docs.map((d: any) => [String(d.id), mapProduct(d)]))
  // Preserve the caller's order.
  return ids.map((id) => map.get(String(id))).filter(Boolean) as StoreProduct[]
}

// Homepage: a few featured products per category.
export async function getFeaturedByCategory(): Promise<
  { category: StoreCategory; products: StoreProduct[] }[]
> {
  const categories = await getCategories()
  const sections = await Promise.all(
    categories.map(async (category) => {
      const { products } = await getProducts({ categorySlug: category.slug, limit: 3 })
      return { category, products }
    }),
  )
  return sections.filter((s) => s.products.length > 0)
}
