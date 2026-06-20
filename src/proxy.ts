import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { currencyForCountry } from '@/lib/format'

// Sets the visitor's display currency cookie from their country (Vercel geo header)
// on first visit, so the storefront can show local pricing.
export function proxy(req: NextRequest) {
  const res = NextResponse.next()
  if (!req.cookies.get('pe_currency')) {
    const country = req.headers.get('x-vercel-ip-country')
    res.cookies.set('pe_currency', currencyForCountry(country), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }
  return res
}

export const config = {
  // Run on storefront pages only — skip API, admin, and static assets.
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico).*)'],
}
