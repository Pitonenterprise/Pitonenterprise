// Payment gateways. Razorpay activates only when its keys are present; Pay-on-Delivery
// is always available so the store works without keys. (Stripe is not used — it is not
// available to Indian businesses.) See Doc/PAYMENTS.md.

export const isRazorpayEnabled = () =>
  !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET

export type PaymentMethod = 'razorpay' | 'cod'

export function enabledMethods(): PaymentMethod[] {
  const methods: PaymentMethod[] = []
  if (isRazorpayEnabled()) methods.push('razorpay')
  methods.push('cod') // always available
  return methods
}

export async function getRazorpay() {
  if (!isRazorpayEnabled()) return null
  const Razorpay = (await import('razorpay')).default
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}
