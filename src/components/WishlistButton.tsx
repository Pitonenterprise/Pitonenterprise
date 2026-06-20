'use client'

import { useStore } from './providers/StoreProvider'

export function WishlistButton({
  productId,
  className = '',
}: {
  productId: string | number
  className?: string
}) {
  const { isWishlisted, toggleWishlist, ready } = useStore()
  const active = ready && isWishlisted(productId)
  return (
    <button
      type="button"
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      onClick={() => toggleWishlist(productId)}
      className={`grid h-9 w-9 place-items-center rounded-full bg-background/90 text-wine shadow-sm transition hover:bg-background ${className}`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path
          d="M12 20S3.5 14.5 3.5 8.8A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 8.5 2.8C20.5 14.5 12 20 12 20Z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
