import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { SortSelect } from './SortSelect'
import type { StoreProduct } from '@/lib/queries'

export function ProductListing({
  eyebrow,
  title,
  description,
  products,
  totalDocs,
  page,
  totalPages,
  basePath,
  sort,
}: {
  eyebrow?: string
  title: string
  description?: string | null
  products: StoreProduct[]
  totalDocs: number
  page: number
  totalPages: number
  basePath: string
  sort: string
}) {
  const pageLink = (p: number) => `${basePath}?sort=${sort}&page=${p}`

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12 md:px-8">
      <header className="mb-8 border-b border-line pb-6">
        {eyebrow && <p className="text-[11px] uppercase tracking-[4px] text-gold">{eyebrow}</p>}
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-foreground md:text-5xl">{title}</h1>
            {description && <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] uppercase tracking-[1.5px] text-muted">
              {totalDocs} {totalDocs === 1 ? 'item' : 'items'}
            </span>
            <SortSelect current={sort} />
          </div>
        </div>
      </header>

      {products.length === 0 ? (
        <p className="py-20 text-center text-muted">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-14 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageLink(p)}
              className={`grid h-9 w-9 place-items-center rounded-full text-sm transition ${
                p === page ? 'bg-wine text-white' : 'border border-line text-foreground hover:border-wine'
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </main>
  )
}
