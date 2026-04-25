"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock_quantity === 0;

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(product, qty);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-black/60">Qty</span>
        <div className="flex items-center border border-black/15 rounded-full">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center hover:bg-[var(--muted)] rounded-l-full"
          >
            −
          </button>
          <span className="px-3 min-w-[2ch] text-center">{qty}</span>
          <button
            onClick={() =>
              setQty((q) => Math.min(product.stock_quantity, q + 1))
            }
            className="w-9 h-9 flex items-center justify-center hover:bg-[var(--muted)] rounded-r-full"
          >
            +
          </button>
        </div>
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <span className="text-xs text-[var(--brand)]">
            Only {product.stock_quantity} left
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-outline flex-1"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="btn-primary flex-1"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
