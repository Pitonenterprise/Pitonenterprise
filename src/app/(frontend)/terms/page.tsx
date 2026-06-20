import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the Piton Enterprise website and purchases.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="20 June 2026">
      <p>
        These terms govern your use of the Piton Enterprise website and any purchases you make. By
        using our site, you agree to them.
      </p>

      <h2>Products &amp; pricing</h2>
      <ul>
        <li>We aim to describe and picture every product as accurately as possible. As items are handcrafted, slight natural variations in colour and finish are normal and not defects.</li>
        <li>Prices are shown in your selected currency and may be converted from our base currency; the amount charged is confirmed at checkout.</li>
        <li>We may update prices and product availability at any time.</li>
      </ul>

      <h2>Orders</h2>
      <p>
        Placing an order is an offer to buy. We confirm orders by email, and we reserve the right
        to decline or cancel an order, for example if an item is out of stock or pricing was
        listed in error, in which case any payment taken is refunded.
      </p>

      <h2>Payment</h2>
      <p>
        We accept payment through our supported providers (such as card and wallet via Stripe, UPI
        and cards via Razorpay, and Pay-on-Delivery where available). Payment must be completed
        before an order is dispatched, except for Pay-on-Delivery orders.
      </p>

      <h2>Shipping &amp; returns</h2>
      <p>
        Delivery times, costs, and our return policy are described on our{' '}
        <Link href="/shipping">Shipping &amp; Returns</Link> page, which forms part of these terms.
      </p>

      <h2>Accounts</h2>
      <p>
        You are responsible for keeping your account details and password secure and for activity
        under your account. Please give accurate information and keep it up to date.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this site, including images, text, logos, and designs, belongs to Piton
        Enterprise or its licensors and may not be used without permission.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the site, attempt to disrupt it, or use it for any unlawful
        purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, Piton Enterprise is not liable for indirect or incidental
        losses arising from use of the site or products. Nothing in these terms limits rights you
        have under applicable consumer law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The current version will always appear on this
        page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach us via our <Link href="/contact">contact page</Link>.
      </p>

      <p className="!mt-10 !text-xs !text-muted">
        These terms are a general starting point and should be reviewed against the laws that apply
        to your business, including your governing jurisdiction.
      </p>
    </LegalPage>
  )
}
