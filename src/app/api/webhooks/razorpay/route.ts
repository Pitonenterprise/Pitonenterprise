import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

// Verifies Razorpay's webhook signature, then marks the matching order paid.
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 400 })

  const raw = await req.text()
  const sig = req.headers.get('x-razorpay-signature') || ''
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  if (expected !== sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(raw)
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const rzpOrderId = event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id
    if (rzpOrderId) {
      const payload = await getPayloadClient()
      const orders = await payload.find({
        collection: 'orders',
        where: { providerRef: { equals: rzpOrderId } },
        limit: 1,
        overrideAccess: true,
      })
      if (orders.docs[0]) {
        await payload.update({
          collection: 'orders',
          id: orders.docs[0].id,
          overrideAccess: true,
          data: { paymentStatus: 'paid' },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
