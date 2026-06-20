'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/providers/StoreProvider'
import { formatPrice } from '@/lib/format'
import type { PaymentMethod } from '@/lib/payments'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: 'Card / Wallet (Stripe)',
  razorpay: 'UPI / Card, India (Razorpay)',
  cod: 'Pay on Delivery',
}

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, ready } = useStore()
  const router = useRouter()
  const [methods, setMethods] = useState<PaymentMethod[]>(['cod'])
  const [method, setMethod] = useState<PaymentMethod>('cod')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '',
  })

  useEffect(() => {
    fetch('/api/checkout/methods')
      .then((r) => r.json())
      .then((d) => {
        if (d.methods?.length) {
          setMethods(d.methods)
          setMethod(d.methods[0])
        }
      })
      .catch(() => {})
  }, [])

  const shipping = cartSubtotal >= 150 ? 0 : cartSubtotal > 0 ? 12 : 0
  const total = cartSubtotal + shipping

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          method,
          items: cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
          shippingAddress: {
            name: form.name, phone: form.phone, line1: form.line1, line2: form.line2,
            city: form.city, state: form.state, postalCode: form.postalCode, country: form.country,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      // Card gateways would confirm via their SDK here using data.clientSecret /
      // data.razorpayOrderId. With keys absent, only COD is offered, which is final now.
      if (method === 'cod' && data.redirect) {
        clearCart()
        router.push(data.redirect)
        return
      }
      if (data.orderNumber) {
        clearCart()
        router.push(`/checkout/success?order=${data.orderNumber}`)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (ready && cart.length === 0) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-24 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <Link href="/products" className="mt-6 inline-block text-wine underline">Shop the collection</Link>
      </main>
    )
  }

  const input = 'h-12 w-full rounded-sm border border-foreground/20 bg-white/50 px-4 text-sm focus:border-wine'

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-12 md:px-8">
      <h1 className="mb-10 font-display text-4xl text-foreground">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 font-display text-2xl">Contact</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} className={`${input} sm:col-span-2`} />
              <input required placeholder="Full name" value={form.name} onChange={set('name')} className={input} />
              <input placeholder="Phone" value={form.phone} onChange={set('phone')} className={input} />
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl">Shipping address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Address line 1" value={form.line1} onChange={set('line1')} className={`${input} sm:col-span-2`} />
              <input placeholder="Address line 2" value={form.line2} onChange={set('line2')} className={`${input} sm:col-span-2`} />
              <input required placeholder="City" value={form.city} onChange={set('city')} className={input} />
              <input placeholder="State / Region" value={form.state} onChange={set('state')} className={input} />
              <input required placeholder="Postal code" value={form.postalCode} onChange={set('postalCode')} className={input} />
              <input required placeholder="Country" value={form.country} onChange={set('country')} className={input} />
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl">Payment</h2>
            <div className="space-y-2">
              {methods.map((m) => (
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 text-sm ${method === m ? 'border-wine bg-gold-soft/20' : 'border-foreground/15'}`}>
                  <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} className="accent-wine" />
                  {METHOD_LABELS[m]}
                </label>
              ))}
            </div>
            {!methods.includes('stripe') && !methods.includes('razorpay') && (
              <p className="mt-3 text-xs text-muted">
                Card payments activate automatically once Stripe / Razorpay keys are added.
              </p>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-sm border border-line bg-white/40 p-6">
          <h2 className="font-display text-2xl">Order</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.map((i) => (
              <li key={`${i.productId}-${i.size ?? ''}`} className="flex justify-between gap-2">
                <span className="text-muted">{i.title}{i.size ? ` · ${i.size}` : ''} × {i.quantity}</span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(cartSubtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base"><dt>Total</dt><dd className="text-wine">{formatPrice(total)}</dd></div>
          </dl>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="mt-6 block w-full rounded-full bg-wine py-3.5 text-center text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep disabled:opacity-60">
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </aside>
      </form>
    </main>
  )
}
