import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getStripe } from '@/lib/payments'

// Stripe is the source of truth for payment status. Verifies the signature, then
// marks the matching order paid. See Doc/PAYMENTS.md.
export async function POST(req: Request) {
  const stripe = await getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  const sig = req.headers.get('stripe-signature') || ''
  const raw = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as { id: string; metadata?: { orderId?: string } }
    const orderId = intent.metadata?.orderId
    if (orderId) {
      const payload = await getPayloadClient()
      await payload.update({
        collection: 'orders',
        id: orderId,
        overrideAccess: true,
        data: { paymentStatus: 'paid', providerRef: intent.id },
      })
    }
  }

  return NextResponse.json({ received: true })
}
