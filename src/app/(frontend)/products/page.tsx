import type { Metadata } from 'next'
import { ProductListing } from '@/components/ProductListing'
import { getProducts } from '@/lib/queries'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse all handcrafted sarees, kurtis, lehengas and western wear.',
}

type SP = { sort?: string; page?: string }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const sort = (sp.sort as 'newest' | 'price-asc' | 'price-desc') || 'newest'
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1)

  const { products, totalPages, totalDocs } = await getProducts({ sort, page })

  return (
    <ProductListing
      eyebrow="The Collection"
      title="Shop All"
      products={products}
      totalDocs={totalDocs}
      page={page}
      totalPages={totalPages}
      basePath="/products"
      sort={sort}
    />
  )
}
