import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductListing } from '@/components/ProductListing'
import { getCollections, getCollectionBySlug, getProducts } from '@/lib/queries'

export const revalidate = 120

export async function generateStaticParams() {
  try {
    const collections = await getCollections()
    return collections.map((c) => ({ slug: c.slug }))
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
  const collection = await getCollectionBySlug(slug)
  if (!collection) return {}
  return {
    title: collection.title,
    description: collection.description || `Shop the ${collection.title} collection at Piton Enterprise.`,
    alternates: { canonical: `/collections/${collection.slug}` },
  }
}

type SP = { sort?: string; page?: string }

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SP>
}) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) notFound()

  const sp = await searchParams
  const sort = (sp.sort as 'newest' | 'price-asc' | 'price-desc') || 'newest'
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)

  const { products, totalPages, totalDocs } = await getProducts({ collectionSlug: slug, sort, page })

  return (
    <ProductListing
      eyebrow={collection.description || 'Collection'}
      title={collection.title}
      products={products}
      totalDocs={totalDocs}
      page={page}
      totalPages={totalPages}
      basePath={`/collections/${slug}`}
      sort={sort}
    />
  )
}
