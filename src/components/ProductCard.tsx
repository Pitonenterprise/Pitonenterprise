import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/currency";

export function ProductCard({ product }: { product: Product }) {
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;
  const outOfStock = product.stock_quantity === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-black/5 hover:shadow-lg transition-all"
    >
      <div className="relative aspect-[3/4] bg-[var(--muted)] overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
            Out of stock
          </span>
        )}
        {lowStock && (
          <span className="absolute top-3 left-3 bg-[var(--brand)] text-white text-xs px-2 py-1 rounded">
            Only {product.stock_quantity} left
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-black/50">
          {product.fabric}
        </p>
        <h3 className="serif text-lg font-medium mt-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[var(--brand)] font-semibold mt-1">
          {formatPrice(product.price_inr)}
        </p>
      </div>
    </Link>
  );
}
