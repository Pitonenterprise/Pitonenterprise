// Flat, country-based shipping (in INR), since the store charges in INR via Razorpay.
export const INDIA_SHIPPING_INR = 50
export const INTERNATIONAL_SHIPPING_INR = 2500

export function isIndia(country?: string): boolean {
  const c = (country || '').trim().toLowerCase()
  return ['india', 'in', 'ind', 'bharat', 'भारत'].includes(c)
}

export function shippingInrFor(country?: string): number {
  return isIndia(country) ? INDIA_SHIPPING_INR : INTERNATIONAL_SHIPPING_INR
}
