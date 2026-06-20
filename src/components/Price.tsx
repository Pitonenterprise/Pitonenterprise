'use client'

import { useCurrency } from './providers/CurrencyProvider'

// Displays a base-INR price in the visitor's local currency.
export function Price({ inr, className }: { inr: number; className?: string }) {
  const { format } = useCurrency()
  return <span className={className}>{format(inr)}</span>
}
