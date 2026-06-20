import { NextResponse } from 'next/server'
import { getProductsByIds } from '@/lib/queries'

// Resolves client-side wishlist/cart product IDs to product data.
export async function GET(req: Request) {
  const idsParam = new URL(req.url).searchParams.get('ids') || ''
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) return NextResponse.json({ products: [] })
  const products = await getProductsByIds(ids)
  return NextResponse.json({ products })
}
