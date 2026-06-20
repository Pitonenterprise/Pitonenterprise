'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/providers/StoreProvider'
import { formatINR } from '@/lib/format'
import { isIndia, INDIA_SHIPPING_INR, INTERNATIONAL_SHIPPING_INR } from '@/lib/shipping'
import { COUNTRIES } from '@/data/countries'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import type { PaymentMethod } from '@/lib/payments'

// Cart prices are already in INR (base currency).
const inr = (n: number) => Math.round(n)

const METHOD_LABELS: Record<PaymentMethod, string> = {
  razorpay: 'Card / UPI / Netbanking (Razorpay)',
  cod: 'Pay on Delivery',
}

// Loads Razorpay Checkout.js once; resolves when window.Razorpay is ready.
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
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

  // All amounts in INR. Shipping is flat per destination country.
  const subtotalInr = inr(cartSubtotal)
  const shippingInr = isIndia(form.country) ? INDIA_SHIPPING_INR : INTERNATIONAL_SHIPPING_INR
  const totalInr = subtotalInr + shippingInr

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const openRazorpay = (data: any) =>
    new Promise<void>(async (resolve) => {
      const ok = await loadRazorpay()
      if (!ok) {
        setError('Could not load the payment gateway. Please try again.')
        setSubmitting(false)
        return resolve()
      }
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        amount: data.amountInr,
        currency: data.currency || 'INR',
        name: 'Piton Enterprise',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { orderNumber: String(data.orderNumber) },
        theme: { color: '#6e1f3b' },
        handler: async (response: any) => {
          try {
            const v = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderNumber: data.orderNumber }),
            })
            const vd = await v.json()
            if (!v.ok) throw new Error(vd.error || 'Payment verification failed')
            clearCart()
            router.push(`/checkout/success?order=${data.orderNumber}`)
          } catch (err) {
            setError((err as Error).message)
            setSubmitting(false)
          }
          resolve()
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled. Your order is saved as pending.')
            setSubmitting(false)
            resolve()
          },
        },
      })
      rzp.on('payment.failed', (resp: any) => {
        setError(resp?.error?.description || 'Payment failed. Please try again.')
        setSubmitting(false)
      })
      rzp.open()
    })

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

      if (data.provider === 'razorpay') {
        await openRazorpay(data) // opens the popup over this page; no redirect
        return
      }

      // Pay on Delivery — order is placed immediately.
      clearCart()
      router.push(data.redirect || `/checkout/success?order=${data.orderNumber}`)
    } catch (err) {
      setError((err as Error).message)
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
            <AddressAutocomplete
              className="mb-3"
              onSelect={(a) =>
                setForm((f) => ({
                  ...f,
                  line1: a.line1 || f.line1,
                  city: a.city || f.city,
                  state: a.state || f.state,
                  postalCode: a.postalCode || f.postalCode,
                  country: a.country && COUNTRIES.includes(a.country) ? a.country : f.country,
                }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Address line 1" value={form.line1} onChange={set('line1')} className={`${input} sm:col-span-2`} />
              <input placeholder="Address line 2" value={form.line2} onChange={set('line2')} className={`${input} sm:col-span-2`} />
              <input required placeholder="City" value={form.city} onChange={set('city')} className={input} />
              <input placeholder="State / Region" value={form.state} onChange={set('state')} className={input} />
              <input required placeholder="Postal code" value={form.postalCode} onChange={set('postalCode')} className={input} />
              <select
                required
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className={`${input} ${form.country ? '' : 'text-muted'}`}
              >
                <option value="" disabled>Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="text-foreground">{c}</option>
                ))}
              </select>
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
            {method === 'razorpay' && (
              <p className="mt-3 text-xs text-muted">
                Secure payment opens in a window on this page (you stay on our site).
              </p>
            )}
            {!methods.includes('razorpay') && (
              <p className="mt-3 text-xs text-muted">
                Online card/UPI payments activate once Razorpay keys are added.
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
                <span>{formatINR(inr(i.price * i.quantity))}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(subtotalInr)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping {isIndia(form.country) ? '(India)' : '(International)'}</dt>
              <dd>{formatINR(shippingInr)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base"><dt>Total</dt><dd className="text-wine">{formatINR(totalInr)}</dd></div>
          </dl>
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="mt-6 block w-full rounded-full bg-wine py-3.5 text-center text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep disabled:opacity-60">
            {submitting ? 'Processing…' : method === 'cod' ? 'Place Order' : 'Pay Now'}
          </button>
        </aside>
      </form>
    </main>
  )
}
