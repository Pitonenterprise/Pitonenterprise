// Currency + price formatting. Prices are stored in a base currency (USD) and
// converted/formatted per the visitor's currency, see Doc/I18N.md.

// Static FX rates (relative to USD). Replace with a live FX source in a later phase.
export const FX_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.2,
  AUD: 1.52,
  CAD: 1.36,
  AED: 3.67,
}

export const SUPPORTED_CURRENCIES = Object.keys(FX_RATES)

export function convertPrice(baseUsd: number, currency: string): number {
  const rate = FX_RATES[currency] ?? 1
  return baseUsd * rate
}

// Format a raw INR amount (already in rupees, not converted from USD).
export function formatINR(amountInr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInr)
}

export function formatPrice(baseUsd: number, currency = 'USD', locale = 'en'): string {
  const value = convertPrice(baseUsd, currency)
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(value)
  } catch {
    return `$${baseUsd.toFixed(2)}`
  }
}
