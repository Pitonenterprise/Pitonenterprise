import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { enabledMethods, getStripe, getRazorpay, type PaymentMethod } from '@/lib/payments'

type IncomingItem = { productId: string | number; size?: string | null; quantity: number }
type Body = {
  items: IncomingItem[]
  email: string
  method: PaymentMethod
  shippingAddress: Record<string, string>
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { items, email, method, shippingAddress } = body
  if (!items?.length || !email) {
    return NextResponse.json({ error: 'Missing items or email' }, { status: 400 })
  }
  if (!enabledMethods().includes(method)) {
    return NextResponse.json({ error: 'Payment method not available' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  // Recompute prices from the DB, never trust client-sent prices.
  const ids = items.map((i) => i.productId)
  const found = await payload.find({
    collection: 'products',
    where: { id: { in: ids } },
    limit: 100,
    overrideAccess: true,
  })
  const byId = new Map(found.docs.map((d: any) => [String(d.id), d]))

  const lineItems = []
  let subtotal = 0
  for (const i of items) {
    const product: any = byId.get(String(i.productId))
    if (!product || product.status !== 'active') continue
    const qty = Math.max(1, Math.min(20, Math.floor(i.quantity)))
    const unitPrice = product.price
    subtotal += unitPrice * qty
    lineItems.push({
      product: product.id,
      title: product.title,
      size: i.size || undefined,
      quantity: qty,
      unitPrice,
    })
  }

  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'No valid items' }, { status: 400 })
  }

  // Shipping + tax from Settings.
  const settings: any = await payload.findGlobal({ slug: 'settings', overrideAccess: true }).catch(() => ({}))
  const freeThreshold = settings?.freeShippingThreshold ?? 150
  const flatShipping = settings?.flatShipping ?? 12
  const taxRate = settings?.taxRate ?? 0
  const shipping = subtotal >= freeThreshold ? 0 : flatShipping
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  // Create the order (pending until payment confirms; COD stays pending until delivery).
  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      email,
      items: lineItems,
      currency: 'USD',
      subtotal,
      shipping,
      tax,
      total,
      paymentProvider: method,
      paymentStatus: 'pending',
      fulfillmentStatus: 'processing',
      shippingAddress,
    },
  })

  // Initialize the gateway.
  if (method === 'cod') {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, redirect: `/checkout/success?order=${order.orderNumber}` })
  }

  if (method === 'stripe') {
    const stripe = await getStripe()
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      receipt_email: email,
      metadata: { orderId: String(order.id), orderNumber: String(order.orderNumber) },
    })
    await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { providerRef: intent.id } })
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, provider: 'stripe', clientSecret: intent.client_secret })
  }

  if (method === 'razorpay') {
    const razorpay = await getRazorpay()
    if (!razorpay) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 400 })
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR', // Razorpay settles in INR
      receipt: String(order.orderNumber),
      notes: { orderId: String(order.id) },
    })
    await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { providerRef: rzpOrder.id } })
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, provider: 'razorpay', razorpayOrderId: rzpOrder.id, keyId: process.env.RAZORPAY_KEY_ID })
  }

  return NextResponse.json({ error: 'Unsupported method' }, { status: 400 })
}
