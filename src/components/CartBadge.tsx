'use client'

import Link from 'next/link'
import { useStore } from './providers/StoreProvider'

export function CartBadge() {
  const { cartCount, ready } = useStore()
  return (
    <Link href="/cart" aria-label="Cart" title="Cart" className="relative text-foreground/80 transition hover:text-wine">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
      </svg>
      {ready && cartCount > 0 && (
        <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-wine px-1 text-[10px] font-medium text-white">
          {cartCount}
        </span>
      )}
    </Link>
  )
}
