'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/components/providers/StoreProvider'
import { useCurrency } from '@/components/providers/CurrencyProvider'

export default function CartPage() {
  const { cart, setQuantity, removeFromCart, cartSubtotal, ready } = useStore()
  const { format } = useCurrency()

  if (!ready) {
    return <main className="mx-auto max-w-[1000px] px-6 py-20 text-center text-muted">Loading…</main>
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-[1000px] px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-foreground">Your bag is empty</h1>
        <p className="mt-3 text-muted">Discover something handcrafted.</p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep"
        >
          Shop the Collection
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-12 md:px-8">
      <h1 className="mb-10 font-display text-4xl text-foreground">Shopping Bag</h1>
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Line items */}
        <ul className="divide-y divide-line">
          {cart.map((item) => (
            <li key={`${item.productId}-${item.size ?? ''}`} className="flex gap-4 py-6">
              <Link href={`/products/${item.slug}`} className="shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.title} width={96} height={128} className="h-32 w-24 rounded-sm object-cover" />
                ) : (
                  <div className="h-32 w-24 rounded-sm" style={{ background: item.accentColor || 'linear-gradient(145deg,#6e1f3b,#4a1228)' }} />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg text-foreground">
                      <Link href={`/products/${item.slug}`} className="hover:text-wine">{item.title}</Link>
                    </h3>
                    {(item.color || item.size) && (
                      <p className="mt-1 text-xs uppercase tracking-[1.5px] text-muted">
                        {item.color}{item.color && item.size ? ' · ' : ''}{item.size ? `Size ${item.size}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-wine">{format(item.price * item.quantity)}</span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-full border border-foreground/20 text-sm">
                    <button aria-label="Decrease" onClick={() => setQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="px-3 py-1.5">−</button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button aria-label="Increase" onClick={() => setQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="px-3 py-1.5">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId, item.size, item.color)} className="text-xs uppercase tracking-[1.5px] text-muted underline hover:text-wine">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-sm border border-line bg-white/40 p-6">
          <h2 className="font-display text-2xl text-foreground">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{format(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-muted">Calculated at checkout</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-wine py-3.5 text-center text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep"
          >
            Checkout
          </Link>
          <Link href="/products" className="mt-3 block text-center text-xs uppercase tracking-[1.5px] text-muted hover:text-wine">
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  )
}
