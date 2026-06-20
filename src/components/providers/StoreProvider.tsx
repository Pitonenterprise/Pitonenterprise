'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

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
  // Account sync
  refreshAccountSync: () => Promise<void>
  detachAccount: () => void
}

const StoreContext = createContext<StoreState | null>(null)

const CART_KEY = 'pe_cart'
const WISH_KEY = 'pe_wishlist'

function sameLine(a: CartItem, productId: string | number, size?: string | null) {
  return a.productId === productId && (a.size ?? null) === (size ?? null)
}

// Merge two carts: union of lines, keeping the higher quantity per line (avoids
// doubling on repeated logins). Account items win on metadata.
function mergeCarts(local: CartItem[], account: CartItem[]): CartItem[] {
  const out = [...account]
  for (const li of local) {
    const idx = out.findIndex((a) => sameLine(a, li.productId, li.size))
    if (idx > -1) out[idx] = { ...out[idx], quantity: Math.max(out[idx].quantity, li.quantity) }
    else out.push(li)
  }
  return out
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<(string | number)[]>([])
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const skipNextSave = useRef(false)

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

  // Persist to localStorage.
  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, ready])
  useEffect(() => {
    if (ready) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist))
  }, [wishlist, ready])

  // Pull the account cart/wishlist and merge with whatever is local.
  const pullAndMerge = useCallback(async () => {
    try {
      const res = await fetch('/api/account/cart', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setCart((prev) => mergeCarts(prev, (data.cart as CartItem[]) || []))
      setWishlist((prev) => Array.from(new Set([...prev, ...((data.wishlist as (string | number)[]) || [])])))
    } catch {}
  }, [])

  // Called by login/register pages on success.
  const refreshAccountSync = useCallback(async () => {
    try {
      const me = await fetch('/api/customers/me', { credentials: 'include' }).then((r) => r.json())
      if (me?.user) {
        setAuthed(true)
        await pullAndMerge()
      }
    } catch {}
  }, [pullAndMerge])

  // Called by logout: stop syncing and clear local state (it's safe in the account).
  const detachAccount = useCallback(() => {
    skipNextSave.current = true
    setAuthed(false)
    setCart([])
    setWishlist([])
  }, [])

  // On first load, detect an existing session and sync.
  useEffect(() => {
    if (!ready) return
    refreshAccountSync()
  }, [ready, refreshAccountSync])

  // Autosave to the account (debounced) whenever cart/wishlist changes while signed in.
  useEffect(() => {
    if (!ready || !authed) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    const t = setTimeout(() => {
      fetch('/api/account/cart', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
          wishlist,
        }),
      }).catch(() => {})
    }, 700)
    return () => clearTimeout(t)
  }, [cart, wishlist, authed, ready])

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
    refreshAccountSync,
    detachAccount,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
