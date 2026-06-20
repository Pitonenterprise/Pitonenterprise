// Money + currency. The store's BASE currency is INR (admin enters rupee prices).
// Storefront displays each visitor's local currency, converted from INR. Checkout
// charges in INR via Razorpay. Replace these static rates with a live FX feed later.

// 1 INR = X <currency>. INR is the base (rate 1).
export const FX_FROM_INR: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
  JPY: 1.8,
}

export const SUPPORTED_CURRENCIES = Object.keys(FX_FROM_INR)

// Currencies that read better without decimals.
const ZERO_DECIMAL = new Set(['INR', 'JPY'])

// Convert a base INR price into the target currency.
export function convertFromInr(priceInr: number, currency: string): number {
  const rate = FX_FROM_INR[currency] ?? FX_FROM_INR.USD
  return priceInr * rate
}

// Format a base INR price in the target display currency.
export function formatMoney(priceInr: number, currency = 'INR', locale = 'en'): string {
  const value = convertFromInr(priceInr, currency)
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: ZERO_DECIMAL.has(currency) ? 0 : 2,
    }).format(value)
  } catch {
    return `₹${Math.round(priceInr)}`
  }
}

// Format a raw INR amount (already rupees).
export function formatINR(amountInr: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInr)
}

// Map an ISO country code (e.g. Vercel's x-vercel-ip-country) to a display currency.
const COUNTRY_CURRENCY: Record<string, string> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AE: 'AED',
  AU: 'AUD',
  CA: 'CAD',
  SG: 'SGD',
  JP: 'JPY',
}
const EUR_COUNTRIES = new Set([
  'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'IE', 'PT', 'AT', 'FI', 'GR', 'LU', 'SK', 'SI', 'EE', 'LV', 'LT', 'CY', 'MT', 'HR',
])

export function currencyForCountry(country?: string | null): string {
  if (!country) return 'USD'
  const c = country.toUpperCase()
  if (COUNTRY_CURRENCY[c]) return COUNTRY_CURRENCY[c]
  if (EUR_COUNTRIES.has(c)) return 'EUR'
  return 'USD' // sensible default for everywhere else
}
