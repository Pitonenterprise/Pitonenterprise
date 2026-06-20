// Friendly, customer-facing labels for the internal order statuses.

export const FULFILLMENT_STEPS = [
  { key: 'processing', label: 'Order Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const

export function fulfillmentStepIndex(status?: string): number {
  const i = FULFILLMENT_STEPS.findIndex((s) => s.key === status)
  return i === -1 ? 0 : i
}

export function isCancelled(status?: string): boolean {
  return status === 'cancelled'
}

// Clear payment label, accounting for Pay-on-Delivery.
export function paymentLabel(paymentStatus?: string, provider?: string): string {
  if (provider === 'cod') {
    if (paymentStatus === 'paid') return 'Paid on delivery'
    return 'Pay on delivery (cash)'
  }
  switch (paymentStatus) {
    case 'paid':
      return 'Paid'
    case 'failed':
      return 'Payment failed'
    case 'refunded':
      return 'Refunded'
    default:
      return 'Payment pending'
  }
}

export function paymentTone(paymentStatus?: string, provider?: string): 'good' | 'warn' | 'bad' {
  if (paymentStatus === 'paid') return 'good'
  if (paymentStatus === 'failed') return 'bad'
  if (provider === 'cod') return 'warn'
  return 'warn'
}

// A single, clear headline for an order.
export function orderHeadline(o: { paymentStatus?: string; fulfillmentStatus?: string; paymentProvider?: string }): string {
  if (isCancelled(o.fulfillmentStatus)) return 'Cancelled'
  switch (o.fulfillmentStatus) {
    case 'delivered':
      return 'Delivered'
    case 'shipped':
      return 'On its way'
    default:
      return o.paymentProvider === 'cod' ? 'Confirmed — Pay on delivery' : 'Order confirmed'
  }
}
