import type { Metadata } from 'next'
import Link from 'next/link'
import { headers as nextHeaders } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import { formatPrice } from '@/lib/format'
import { LogoutButton } from '@/components/LogoutButton'

// User-specific (reads the auth cookie) — never prerender at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false },
}

export default async function AccountPage() {
  const payload = await getPayloadClient()
  const h = await nextHeaders()
  const { user } = await payload.auth({ headers: h })

  if (!user || user.collection !== 'customers') {
    return (
      <main className="mx-auto max-w-[420px] px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-foreground">My Account</h1>
        <p className="mt-3 text-muted">Sign in to view your orders and wishlist.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/account/login" className="rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep">
            Sign in
          </Link>
          <Link href="/account/register" className="rounded-full border border-foreground/20 px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] transition hover:border-wine">
            Register
          </Link>
        </div>
      </main>
    )
  }

  const customer = user as { id: string | number; email: string; firstName?: string }
  const orders = await payload.find({
    collection: 'orders',
    where: { email: { equals: customer.email } },
    sort: '-createdAt',
    limit: 50,
    overrideAccess: true,
  })

  return (
    <main className="mx-auto max-w-[900px] px-6 py-12 md:px-8">
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <h1 className="font-display text-4xl text-foreground">
            Hello{customer.firstName ? `, ${customer.firstName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted">{customer.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="mt-10 mb-4 font-display text-2xl text-foreground">Order history</h2>
      {orders.docs.length === 0 ? (
        <p className="py-10 text-muted">
          No orders yet.{' '}
          <Link href="/products" className="text-wine underline">Start shopping</Link>.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {orders.docs.map((o: any) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div>
                <p className="font-medium text-foreground">{o.orderNumber}</p>
                <p className="text-xs uppercase tracking-[1.5px] text-muted">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items?.length ?? 0} item(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-gold-soft/40 px-3 py-1 text-[10px] uppercase tracking-[1.5px] text-wine">
                  {o.paymentStatus} · {o.fulfillmentStatus}
                </span>
                <span className="text-wine">{formatPrice(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
