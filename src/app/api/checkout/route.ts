import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { enabledMethods, getRazorpay, type PaymentMethod } from '@/lib/payments'
import { shippingInrFor } from '@/lib/shipping'

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

  // Everything is charged in INR. Convert product prices (USD base) to INR; shipping is
  // flat per country (India vs international).
  const lineItems = []
  let subtotal = 0 // INR
  for (const i of items) {
    const product: any = byId.get(String(i.productId))
    if (!product || product.status !== 'active') continue
    const qty = Math.max(1, Math.min(20, Math.floor(i.quantity)))
    const unitPrice = Math.round(product.price) // already INR
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

  const settings: any = await payload.findGlobal({ slug: 'settings', overrideAccess: true }).catch(() => ({}))
  const taxRate = settings?.taxRate ?? 0
  const shipping = shippingInrFor(shippingAddress?.country) // INR
  const tax = Math.round(subtotal * (taxRate / 100))
  const total = subtotal + shipping + tax // INR

  // Create the order (pending until payment confirms; COD stays pending until delivery).
  const order = await payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      email,
      items: lineItems,
      currency: 'INR',
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

  if (method === 'razorpay') {
    const razorpay = await getRazorpay()
    if (!razorpay) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 400 })
    // total is already in INR; Razorpay amount is in paise.
    const amountInr = Math.round(total * 100)
    const rzpOrder = await razorpay.orders.create({
      amount: amountInr,
      currency: 'INR',
      receipt: String(order.orderNumber),
      notes: { orderId: String(order.id) },
    })
    await payload.update({ collection: 'orders', id: order.id, overrideAccess: true, data: { providerRef: rzpOrder.id } })
    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      provider: 'razorpay',
      razorpayOrderId: rzpOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amountInr,
      currency: 'INR',
    })
  }

  return NextResponse.json({ error: 'Unsupported method' }, { status: 400 })
}
