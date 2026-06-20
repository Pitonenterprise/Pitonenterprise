import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Worldwide Shipping & Returns',
  description:
    'How Piton Enterprise ships handcrafted sarees, kurtis and lehengas worldwide, processing times, delivery estimates, costs, customs, tracking, and our 7-day return policy.',
  alternates: { canonical: '/shipping' },
}

export default function ShippingPage() {
  return (
    <LegalPage title="Worldwide Shipping & Returns" updated="20 June 2026">
      <p>
        We ship our handcrafted pieces to customers around the world. Every order is packed with
        care so it reaches you exactly as it left our hands.
      </p>

      <h2>Order processing</h2>
      <p>
        Most orders are processed within 1-3 business days. Because many of our pieces are made
        and finished by hand, certain items may need a little longer, if so, we&apos;ll let you
        know by email.
      </p>

      <h2>Delivery estimates</h2>
      <p>Once dispatched, typical delivery times are:</p>
      <ul>
        <li>India: 3-6 business days</li>
        <li>Asia &amp; Middle East: 5-10 business days</li>
        <li>Europe &amp; UK: 7-12 business days</li>
        <li>North America, Australia &amp; rest of world: 8-15 business days</li>
      </ul>
      <p>These are estimates and may vary with customs clearance and local courier schedules.</p>

      <h2>Shipping costs</h2>
      <ul>
        <li>Enjoy free shipping on orders over the threshold shown at checkout.</li>
        <li>A flat shipping fee applies to orders below that threshold, calculated at checkout.</li>
        <li>Your exact shipping cost is always shown before you pay.</li>
      </ul>

      <h2>Customs, duties &amp; taxes</h2>
      <p>
        International orders may be subject to import duties or taxes set by the destination
        country. These are not included in your order total and are the responsibility of the
        recipient. Please check your local rules if you&apos;re unsure.
      </p>

      <h2>Tracking your order</h2>
      <p>
        Once your order ships, we&apos;ll share tracking details by email. You can also view your
        order status anytime in your <Link href="/account">account</Link>.
      </p>

      <h2>Returns &amp; exchanges</h2>
      <p>
        We want you to love what you receive. If something isn&apos;t right, you may request a
        return or exchange within 7 days of delivery, provided the item is unused, unwashed, and
        in its original condition with tags attached.
      </p>
      <ul>
        <li>To start a return, contact us with your order number.</li>
        <li>Return shipping costs are the customer&apos;s responsibility unless the item arrived faulty or incorrect.</li>
        <li>Once we receive and inspect the item, eligible refunds are issued to your original payment method.</li>
        <li>For hygiene reasons, certain items may not be eligible for return, this will be noted on the product page.</li>
      </ul>

      <h2>Questions?</h2>
      <p>
        For anything about shipping or returns, reach us through our{' '}
        <Link href="/contact">contact page</Link>, we&apos;re happy to help.
      </p>
    </LegalPage>
  )
}
