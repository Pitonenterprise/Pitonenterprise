// Payment gateway helpers. Both providers are OPTIONAL, they activate only when
// their env keys are present, so the store runs (with Pay-on-Delivery) without them.
// See Doc/PAYMENTS.md.

export const isStripeEnabled = () => !!process.env.STRIPE_SECRET_KEY
export const isRazorpayEnabled = () =>
  !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET

export type PaymentMethod = 'stripe' | 'razorpay' | 'cod'

export function enabledMethods(): PaymentMethod[] {
  const methods: PaymentMethod[] = []
  if (isStripeEnabled()) methods.push('stripe')
  if (isRazorpayEnabled()) methods.push('razorpay')
  methods.push('cod') // always available
  return methods
}

export async function getStripe() {
  if (!isStripeEnabled()) return null
  const { default: Stripe } = await import('stripe')
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function getRazorpay() {
  if (!isRazorpayEnabled()) return null
  const Razorpay = (await import('razorpay')).default
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}
