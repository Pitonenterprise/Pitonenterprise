import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// Verifies a Razorpay payment signature after the popup completes, then marks the
// order paid. (The webhook is a second, independent confirmation.)
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 400 })

  let body: {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    orderNumber?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))

  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
    overrideAccess: true,
  })
  const order = found.docs[0]

  if (!valid) {
    if (order) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        overrideAccess: true,
        data: { paymentStatus: 'failed' },
      })
    }
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  if (order) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: { paymentStatus: 'paid', providerRef: razorpay_payment_id },
    })
  }

  return NextResponse.json({ ok: true })
}
