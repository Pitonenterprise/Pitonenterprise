import Link from 'next/link'
import Image from 'next/image'
import type { StoreProduct } from '@/lib/queries'
import { Price } from './Price'
import { WishlistButton } from './WishlistButton'

export function ProductCard({ product }: { product: StoreProduct }) {
  const hasImage = !!product.image?.url
  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm bg-line/40">
          {hasImage ? (
            <Image
              src={product.image!.url}
              alt={product.image!.alt || product.title}
              width={768}
              height={1024}
              className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="aspect-[3/4] w-full transition duration-500 group-hover:scale-[1.03]"
              style={{ background: product.accentColor || 'linear-gradient(145deg,#6e1f3b,#4a1228)' }}
            />
          )}
          {product.badge && (
            <span className="absolute left-3 top-3 bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[2px] text-wine">
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100"
      />
      <div className="mt-3 space-y-1">
        {product.fabric && (
          <p className="text-[10px] uppercase tracking-[2px] text-muted">{product.fabric}</p>
        )}
        <h3 className="font-display text-[17px] leading-snug text-foreground">
          <Link href={`/products/${product.slug}`} className="transition hover:text-wine">
            {product.title}
          </Link>
        </h3>
        <p className="flex items-center gap-2 text-sm">
          <Price inr={product.price} className="text-wine" />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Price inr={product.compareAtPrice} className="text-xs text-muted line-through" />
          )}
        </p>
      </div>
    </div>
  )
}
