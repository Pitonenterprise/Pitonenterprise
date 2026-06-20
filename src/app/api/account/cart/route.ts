import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getProductsByIds } from '@/lib/queries'

// Account-synced cart + wishlist. Both endpoints require an authenticated customer.
async function getCustomer(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.collection !== 'customers') return { payload, user: null }
  return { payload, user }
}

export async function GET(req: Request) {
  const { payload, user } = await getCustomer(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const customer: any = await payload.findByID({
    collection: 'customers',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  const wishlist = (customer.wishlist || []).map((id: unknown) =>
    typeof id === 'object' && id ? (id as any).id : id,
  )

  const cartRows: any[] = customer.cart || []
  const ids = cartRows.map((r) => r.product).filter(Boolean)
  const products = await getProductsByIds(ids)
  const byId = new Map(products.map((p) => [String(p.id), p]))

  const cart = cartRows
    .map((r) => {
      const p = byId.get(String(r.product))
      if (!p) return null
      return {
        productId: p.id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        image: p.image?.url ?? null,
        accentColor: p.accentColor ?? null,
        size: r.size ?? null,
        quantity: r.quantity ?? 1,
      }
    })
    .filter(Boolean)

  return NextResponse.json({ cart, wishlist })
}

export async function PUT(req: Request) {
  const { payload, user } = await getCustomer(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let body: { cart?: any[]; wishlist?: (string | number)[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const cart = (body.cart || []).map((i) => ({
    product: i.productId,
    size: i.size || undefined,
    quantity: Math.max(1, Math.floor(i.quantity || 1)),
  }))
  const wishlist = (body.wishlist || []).filter(Boolean)

  await payload.update({
    collection: 'customers',
    id: user.id,
    overrideAccess: true,
    data: { cart, wishlist },
  })

  return NextResponse.json({ ok: true })
}
