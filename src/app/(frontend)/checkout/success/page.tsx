import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false },
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams

  return (
    <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-wine text-white">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="font-display text-4xl text-foreground">Thank you for your order</h1>
      {order && (
        <p className="mt-3 text-muted">
          Your order <span className="font-medium text-foreground">{order}</span> has been placed.
          A confirmation will be sent to your email.
        </p>
      )}
      <p className="mt-2 text-sm text-muted">
        We&apos;re preparing your handcrafted pieces with care.
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <Link href="/products" className="rounded-full bg-wine px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] text-white transition hover:bg-wine-deep">
          Continue Shopping
        </Link>
        <Link href="/account" className="rounded-full border border-foreground/20 px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] transition hover:border-wine">
          View Orders
        </Link>
      </div>
    </main>
  )
}
