import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Piton Enterprise collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
  robots: { index: true },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="20 June 2026">
      <p>
        Piton Enterprise (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy
        explains what information we collect when you use our website and how we use and protect
        it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account details</strong> — your name, email, and password when you register.</li>
        <li><strong>Order details</strong> — items ordered, shipping and billing address, and contact number.</li>
        <li><strong>Payment information</strong> — processed securely by our payment providers; we do not store your full card details.</li>
        <li><strong>Communications</strong> — messages you send us through forms or email.</li>
        <li><strong>Usage data</strong> — basic information your browser shares, such as device and pages viewed, to help the site work and improve.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and deliver your orders and provide customer support.</li>
        <li>To verify your account (e.g. one-time email codes) and keep it secure.</li>
        <li>To send order updates and, where you&apos;ve opted in, occasional news and offers.</li>
        <li>To improve our products, website, and service.</li>
      </ul>

      <h2>Sharing your information</h2>
      <p>We share information only as needed to run the store, with trusted providers such as:</p>
      <ul>
        <li>Payment processors (e.g. Stripe, Razorpay) to take payment securely.</li>
        <li>Shipping and logistics partners to deliver your order.</li>
        <li>Email and hosting providers that power our website and notifications.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Cookies &amp; local storage</h2>
      <p>
        We use your browser&apos;s storage to keep your cart and preferences, and cookies to keep
        you signed in. You can clear these in your browser settings, though some features may stop
        working as expected.
      </p>

      <h2>Data security &amp; retention</h2>
      <p>
        We take reasonable measures to protect your information and keep it only as long as needed
        to provide our service and meet legal obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal information. To do
        so, contact us using the details below. You can update most account information directly in
        your <Link href="/account">account</Link>.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The latest version will always be available on
        this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Reach us via our{' '}
        <Link href="/contact">contact page</Link>.
      </p>

      <p className="!mt-10 !text-xs !text-muted">
        This policy is provided as a general starting point and should be reviewed against the laws
        that apply to your business and customers.
      </p>
    </LegalPage>
  )
}
