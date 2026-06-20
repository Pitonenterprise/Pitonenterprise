import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductListing } from '@/components/ProductListing'
import { getCategories, getCategoryBySlug, getProducts } from '@/lib/queries'

export const revalidate = 120

export async function generateStaticParams() {
  // Defensive: never let a build-time DB hiccup fail the whole build.
  // Pages still render on demand via ISR.
  try {
    const categories = await getCategories()
    return categories.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.title,
    description: category.description || `Shop ${category.title} at Piton Enterprise.`,
    alternates: { canonical: `/products/category/${category.slug}` },
  }
}

type SP = { sort?: string; page?: string }

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SP>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const sp = await searchParams
  const sort = (sp.sort as 'newest' | 'price-asc' | 'price-desc') || 'newest'
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)

  const { products, totalPages, totalDocs } = await getProducts({ categorySlug: slug, sort, page })

  return (
    <ProductListing
      eyebrow={category.description || 'Collection'}
      title={category.title}
      products={products}
      totalDocs={totalDocs}
      page={page}
      totalPages={totalPages}
      basePath={`/products/category/${slug}`}
      sort={sort}
    />
  )
}
