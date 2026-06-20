import type { Metadata } from 'next'
import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { formatINR } from '@/lib/format'
import { DownloadReceiptButton } from '@/components/DownloadReceiptButton'
import {
  FULFILLMENT_STEPS,
  fulfillmentStepIndex,
  isCancelled,
  orderHeadline,
  paymentLabel,
} from '@/lib/orderStatus'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Order', robots: { index: false } }

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const payload = await getPayloadClient()
  const h = await nextHeaders()
  const { user } = await payload.auth({ headers: h })

  if (!user || user.collection !== 'customers') {
    return (
      <main className="mx-auto max-w-[600px] px-6 py-24 text-center">
        <p className="text-muted">Please sign in to view this order.</p>
        <Link href={`/account/login?redirect=/account/orders/${orderNumber}`} className="mt-4 inline-block text-wine underline">
          Sign in
        </Link>
      </main>
    )
  }

  const res = await payload.find({
    collection: 'orders',
    where: {
      and: [{ orderNumber: { equals: orderNumber } }, { email: { equals: (user as any).email } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const order: any = res.docs[0]
  if (!order) notFound()

  const stepIndex = fulfillmentStepIndex(order.fulfillmentStatus)
  const cancelled = isCancelled(order.fulfillmentStatus)
  const addr = order.shippingAddress || {}
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <main className="mx-auto max-w-[760px] px-6 py-12 md:px-8">
      {/* Header / actions (hidden when printing) */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href="/account" className="text-[12px] uppercase tracking-[1.5px] text-muted hover:text-wine">
          ← Back to account
        </Link>
        <DownloadReceiptButton orderNumber={order.orderNumber} />
      </div>

      {/* Receipt body */}
      <div className="rounded-sm border border-line bg-white/50 p-8 print:border-0 print:p-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <div className="font-display text-2xl text-wine">Piton Enterprise</div>
            <div className="text-[9.5px] uppercase tracking-[4px] text-gold">Handcrafted Wear</div>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium text-foreground">Receipt</p>
            <p className="text-muted">{order.orderNumber}</p>
            <p className="text-muted">{date}</p>
          </div>
        </div>

        {/* Status */}
        <section className="py-6">
          <p className="text-[11px] uppercase tracking-[3px] text-gold">Status</p>
          <h1 className="mt-1 font-display text-3xl text-foreground">{orderHeadline(order)}</h1>

          {cancelled ? (
            <p className="mt-3 inline-block rounded-full bg-red-50 px-3 py-1 text-sm text-red-700">
              This order was cancelled.
            </p>
          ) : (
            <ol className="mt-5 flex items-center">
              {FULFILLMENT_STEPS.map((step, i) => {
                const done = i <= stepIndex
                return (
                  <li key={step.key} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] ${done ? 'bg-wine text-white' : 'border border-line text-muted'}`}>
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={`mt-1 text-[10px] uppercase tracking-[1px] ${done ? 'text-foreground' : 'text-muted'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < FULFILLMENT_STEPS.length - 1 && (
                      <span className={`mx-2 h-px flex-1 ${i < stepIndex ? 'bg-wine' : 'bg-line'}`} />
                    )}
                  </li>
                )
              })}
            </ol>
          )}

          <p className="mt-5 text-sm text-muted">
            Payment: <strong className="text-foreground">{paymentLabel(order.paymentStatus, order.paymentProvider)}</strong>
          </p>
        </section>

        {/* Items */}
        <section className="border-t border-line py-6">
          <p className="mb-3 text-[11px] uppercase tracking-[3px] text-gold">Items</p>
          <ul className="space-y-2 text-sm">
            {(order.items || []).map((it: any, i: number) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-foreground">
                  {it.title}{it.size ? ` · ${it.size}` : ''} × {it.quantity}
                </span>
                <span>{formatINR((it.unitPrice || 0) * (it.quantity || 1))}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(order.subtotal || 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{formatINR(order.shipping || 0)}</dd></div>
            {order.tax ? <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatINR(order.tax)}</dd></div> : null}
            <div className="flex justify-between border-t border-line pt-2 text-base font-medium"><dt>Total</dt><dd className="text-wine">{formatINR(order.total || 0)}</dd></div>
          </dl>
        </section>

        {/* Shipping address */}
        <section className="border-t border-line py-6">
          <p className="mb-2 text-[11px] uppercase tracking-[3px] text-gold">Shipping to</p>
          <address className="text-sm not-italic leading-relaxed text-foreground">
            {addr.name && <>{addr.name}<br /></>}
            {addr.line1 && <>{addr.line1}<br /></>}
            {addr.line2 && <>{addr.line2}<br /></>}
            {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}<br />
            {addr.country}
            {addr.phone && <><br />{addr.phone}</>}
          </address>
          <p className="mt-3 text-xs text-muted">{order.email}</p>
        </section>

        <p className="border-t border-line pt-6 text-center text-xs text-muted">
          Thank you for shopping with Piton Enterprise. For help, contact us via our website.
        </p>
      </div>
    </main>
  )
}
