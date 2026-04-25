import Link from "next/link";
import { getOrderById } from "@/lib/store";
import { formatPrice } from "@/lib/currency";

export default async function SuccessPage(props: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await props.searchParams;
  const order = orderId ? getOrderById(orderId) : undefined;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="serif text-3xl md:text-4xl mb-3">Thank you!</h1>
      <p className="text-black/60">
        Your order has been received. We&apos;ll send a confirmation email shortly.
      </p>

      {order && (
        <div className="mt-10 text-left bg-[var(--muted)] rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-black/55">
            Order ID
          </p>
          <p className="font-mono text-lg">{order.id}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.product_id} className="flex justify-between">
                <span>{i.product_name} × {i.quantity}</span>
                <span>{formatPrice(i.price_inr * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-black/10 mt-4 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-[var(--brand)]">
              {formatPrice(order.total_inr)}
            </span>
          </div>
          <p className="text-xs text-black/55 mt-4">
            Track this order from your account using {order.customer_email}.
          </p>
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/products" className="btn-outline">Keep shopping</Link>
        <Link href="/account" className="btn-primary">View orders</Link>
      </div>
    </div>
  );
}
