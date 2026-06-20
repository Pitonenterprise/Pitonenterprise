'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  productId: string | number
  slug: string
  title: string
  price: number // base USD
  image?: string | null
  accentColor?: string | null
  size?: string | null
  quantity: number
}

type StoreState = {
  cart: CartItem[]
  wishlist: (string | number)[]
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeFromCart: (productId: string | number, size?: string | null) => void
  setQuantity: (productId: string | number, size: string | null | undefined, qty: number) => void
  clearCart: () => void
  toggleWishlist: (productId: string | number) => void
  isWishlisted: (productId: string | number) => boolean
  cartCount: number
  cartSubtotal: number
  ready: boolean
}

const StoreContext = createContext<StoreState | null>(null)

const CART_KEY = 'pe_cart'
const WISH_KEY = 'pe_wishlist'

function sameLine(a: CartItem, productId: string | number, size?: string | null) {
  return a.productId === productId && (a.size ?? null) === (size ?? null)
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<(string | number)[]>([])
  const [ready, setReady] = useState(false)

  // Hydrate from localStorage.
  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY)
      const w = localStorage.getItem(WISH_KEY)
      if (c) setCart(JSON.parse(c))
      if (w) setWishlist(JSON.parse(w))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, ready])
  useEffect(() => {
    if (ready) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist))
  }, [wishlist, ready])

  const addToCart: StoreState['addToCart'] = useCallback((item, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => sameLine(p, item.productId, item.size))
      if (idx > -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty }
        return next
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }, [])

  const removeFromCart: StoreState['removeFromCart'] = useCallback((productId, size) => {
    setCart((prev) => prev.filter((p) => !sameLine(p, productId, size)))
  }, [])

  const setQuantity: StoreState['setQuantity'] = useCallback((productId, size, qty) => {
    setCart((prev) =>
      prev
        .map((p) => (sameLine(p, productId, size) ? { ...p, quantity: Math.max(0, qty) } : p))
        .filter((p) => p.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleWishlist: StoreState['toggleWishlist'] = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }, [])

  const isWishlisted = useCallback(
    (productId: string | number) => wishlist.includes(productId),
    [wishlist],
  )

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart])
  const cartSubtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart])

  const value: StoreState = {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    toggleWishlist,
    isWishlisted,
    cartCount,
    cartSubtotal,
    ready,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
