'use client'

import { useState } from 'react'
import { useStore, type CartItem } from './providers/StoreProvider'

type Size = { label: string; stock: number }

export function AddToCartButton({
  item,
  sizes = [],
}: {
  item: Omit<CartItem, 'quantity' | 'size'>
  sizes?: Size[]
}) {
  const { addToCart } = useStore()
  const [size, setSize] = useState<string | null>(sizes[0]?.label ?? null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart({ ...item, size }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[2px] text-muted">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const out = s.stock <= 0
              const active = size === s.label
              return (
                <button
                  key={s.label}
                  type="button"
                  disabled={out}
                  onClick={() => setSize(s.label)}
                  className={`min-w-11 rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? 'border-wine bg-wine text-white'
                      : 'border-foreground/20 text-foreground hover:border-wine'
                  } ${out ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-foreground/20">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-lg leading-none"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2.5 text-lg leading-none"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep"
        >
          {added ? 'Added ✓' : 'Add to Bag'}
        </button>
      </div>
    </div>
  )
}
