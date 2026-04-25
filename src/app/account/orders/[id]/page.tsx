import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/store";
import { formatPrice } from "@/lib/currency";

export default async function OrderDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const steps: { key: string; label: string }[] = [
    { key: "pending", label: "Order placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <Link href="/account" className="text-sm text-[var(--brand)] hover:underline">
        ← Back to orders
      </Link>
      <h1 className="serif text-3xl mt-3">Order {order.id}</h1>
      <p className="text-sm text-black/55">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      {/* Tracker */}
      {order.status !== "cancelled" && order.status !== "returned" && (
        <div className="mt-8 bg-white rounded-2xl border border-black/5 p-6">
          <div className="flex justify-between">
            {steps.map((step, i) => (
              <div
                key={step.key}
                className="flex-1 flex flex-col items-center text-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i <= currentIdx
                      ? "bg-[var(--brand)] text-white"
                      : "bg-[var(--muted)] text-black/40"
                  }`}
                >
                  {i + 1}
                </div>
                <p className={`text-xs mt-2 ${i <= currentIdx ? "text-black" : "text-black/40"}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
          {order.tracking_number && (
            <p className="mt-4 text-sm text-center text-black/70">
              Tracking number: <span className="font-mono">{order.tracking_number}</span>
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="mt-8 bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="serif text-xl mb-4">Items</h2>
        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex gap-4">
              <Link
                href={`/products/${item.product_slug}`}
                className="relative w-20 h-24 rounded-lg overflow-hidden bg-[var(--muted)] shrink-0"
              >
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </Link>
              <div className="flex-1">
                <Link
                  href={`/products/${item.product_slug}`}
                  className="serif text-base hover:text-[var(--brand)]"
                >
                  {item.product_name}
                </Link>
                <p className="text-xs text-black/55 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-[var(--brand)]">
                {formatPrice(item.price_inr * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t border-black/10 mt-4 pt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-[var(--brand)]">{formatPrice(order.total_inr)}</span>
        </div>
      </div>

      {/* Address */}
      <div className="mt-6 bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="serif text-xl mb-3">Shipping to</h2>
        <p className="text-sm leading-relaxed">
          {order.customer_name}<br />
          {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}<br />
          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
          {order.shipping_address.country}
        </p>
      </div>
    </div>
  );
}
