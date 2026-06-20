'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/components/providers/StoreProvider'
import { ProductCard } from '@/components/ProductCard'
import type { StoreProduct } from '@/lib/queries'

export default function WishlistPage() {
  const { wishlist, ready } = useStore()
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (wishlist.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/products/by-ids?ids=${wishlist.join(',')}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false))
  }, [wishlist, ready])

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-12 md:px-8">
      <h1 className="mb-10 font-display text-4xl text-foreground">Wishlist</h1>

      {loading ? (
        <p className="py-16 text-center text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">Your wishlist is empty.</p>
          <Link href="/products" className="mt-4 inline-block text-wine underline">
            Find something you love
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}
