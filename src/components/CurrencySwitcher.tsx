'use client'

import { useCurrency } from './providers/CurrencyProvider'
import { SUPPORTED_CURRENCIES } from '@/lib/format'

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  return (
    <label className="relative">
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        aria-label="Currency"
        className="cursor-pointer appearance-none bg-transparent pr-3 text-[12px] uppercase tracking-[1px] text-foreground/80 transition hover:text-wine focus:outline-none"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  )
}
