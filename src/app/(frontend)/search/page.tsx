import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { getProducts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false }, // don't index search result pages
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q || '').trim()
  const { products, totalDocs } = query
    ? await getProducts({ search: query, limit: 48 })
    : { products: [], totalDocs: 0 }

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12 md:px-8">
      <form action="/search" className="mx-auto mb-10 max-w-xl">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search sarees, kurtis, lehengas…"
          className="h-12 w-full rounded-full border border-foreground/20 bg-background px-6 text-sm focus:border-wine"
          autoFocus
        />
      </form>

      {query && (
        <p className="mb-8 text-center text-sm text-muted">
          {totalDocs} {totalDocs === 1 ? 'result' : 'results'} for “{query}”
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : query ? (
        <div className="py-16 text-center">
          <p className="text-muted">No matches. Try another term or browse the collection.</p>
          <Link href="/products" className="mt-4 inline-block text-wine underline">
            Shop all
          </Link>
        </div>
      ) : null}
    </main>
  )
}
