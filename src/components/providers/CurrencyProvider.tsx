'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { formatMoney } from '@/lib/format'

type CurrencyState = {
  currency: string
  setCurrency: (c: string) => void
  format: (priceInr: number) => string
}

const CurrencyContext = createContext<CurrencyState | null>(null)

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

export function CurrencyProvider({
  initialCurrency = 'USD',
  children,
}: {
  initialCurrency?: string
  children: React.ReactNode
}) {
  const [currency, setCurrencyState] = useState(initialCurrency)

  // After hydration, reconcile to the geo currency the middleware stored in the cookie.
  useEffect(() => {
    const fromCookie = readCookie('pe_currency')
    if (fromCookie && fromCookie !== currency) setCurrencyState(fromCookie)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCurrency = (c: string) => {
    setCurrencyState(c)
    document.cookie = `pe_currency=${c}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  const format = (priceInr: number) => formatMoney(priceInr, currency)

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
