'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ProductGallery } from './ProductGallery'
import { AddToCartButton } from './AddToCartButton'
import { WishlistButton } from './WishlistButton'
import { Price } from './Price'
import type { StoreImage } from '@/lib/queries'

type BuyColor = { name: string; available: boolean; images: StoreImage[] }

type BuyProduct = {
  id: string | number
  slug: string
  title: string
  price: number
  compareAtPrice?: number | null
  badge?: string | null
  categoryTitle?: string | null
  accentColor?: string | null
  image: StoreImage
  images: StoreImage[]
  colors: BuyColor[]
  sizes: { label: string; stock: number }[]
}

export function ProductBuyArea({
  product,
  children,
}: {
  product: BuyProduct
  children?: React.ReactNode
}) {
  const colors = product.colors || []
  const hasColors = colors.length > 0
  const firstAvailable = Math.max(0, colors.findIndex((c) => c.available))
  const [colorIdx, setColorIdx] = useState(hasColors ? firstAvailable : 0)

  const selected = hasColors ? colors[colorIdx] : null
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price

  // Gallery: the selected color's photos (default first, set in the data layer).
  const galleryImages: StoreImage[] = hasColors ? selected?.images ?? [] : product.images

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      {/* Keyed by color so the gallery resets to the selected color's hero image. */}
      <ProductGallery
        key={colorIdx}
        images={galleryImages}
        accentColor={product.accentColor}
        title={product.title}
      />

      <div className="md:py-4">
        {product.categoryTitle && (
          <p className="text-[11px] uppercase tracking-[3px] text-gold">{product.categoryTitle}</p>
        )}
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground md:text-5xl">
          {product.title}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <Price inr={product.price} className="text-2xl text-wine" />
          {onSale && <Price inr={product.compareAtPrice!} className="text-base text-muted line-through" />}
          {product.badge && (
            <span className="bg-gold-soft/50 px-3 py-1 text-[10px] uppercase tracking-[2px] text-wine">
              {product.badge}
            </span>
          )}
        </div>

        {/* Color picker */}
        {hasColors && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] uppercase tracking-[2px] text-muted">
              Color{selected ? `: ${selected.name}` : ''}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c, i) => {
                const active = i === colorIdx
                const soldOut = !c.available
                return (
                  <button
                    key={`${c.name}-${i}`}
                    type="button"
                    disabled={soldOut}
                    onClick={() => setColorIdx(i)}
                    title={`${c.name}${soldOut ? ' — Sold out' : ''}`}
                    aria-pressed={active}
                    className={`relative h-14 w-14 overflow-hidden rounded-sm border transition ${
                      active ? 'border-wine ring-1 ring-wine' : 'border-line hover:border-wine'
                    } ${soldOut ? 'cursor-not-allowed' : ''}`}
                  >
                    {c.images[0]?.url ? (
                      <Image src={c.images[0].url} alt={c.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <span className="block h-full w-full" style={{ background: product.accentColor || '#6e1f3b' }} />
                    )}
                    {soldOut && (
                      <span className="absolute inset-0 grid place-items-center bg-background/60 text-[8px] uppercase tracking-wide text-foreground/70">
                        Sold
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <AddToCartButton
            item={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              image: (selected?.images[0]?.url ?? product.image?.url) ?? null,
              accentColor: product.accentColor ?? null,
              color: selected?.name ?? null,
            }}
            sizes={product.sizes}
          />
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm text-muted">
          <WishlistButton productId={product.id} className="!static opacity-100" />
          <span>Save to wishlist</span>
        </div>

        {children}
      </div>
    </div>
  )
}
