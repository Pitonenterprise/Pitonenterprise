import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrderById } from "@/lib/store";
import { formatPrice } from "@/lib/currency";
import { OrderStatusUpdater } from "@/components/OrderStatusUpdater";

export default async function AdminOrderDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-[var(--brand)]">← All orders</Link>
      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="serif text-2xl">{order.id}</h2>
        <p className="text-sm text-black/55 mt-1">
          Placed {new Date(order.created_at).toLocaleString()}
        </p>
        <div className="mt-4">
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentTracking={order.tracking_number}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h3 className="serif text-lg mb-3">Customer</h3>
        <p className="text-sm">{order.customer_name}</p>
        <p className="text-sm text-black/65">{order.customer_email}</p>
        {order.customer_phone && <p className="text-sm text-black/65">{order.customer_phone}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h3 className="serif text-lg mb-3">Items</h3>
        <ul className="space-y-3">
          {order.items.map((i) => (
            <li key={i.product_id} className="flex gap-3">
              <div className="relative w-14 h-18 rounded overflow-hidden bg-[var(--muted)]">
                <Image src={i.image_url} alt={i.product_name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{i.product_name}</p>
                <p className="text-xs text-black/55">Qty: {i.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(i.price_inr * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-black/10 mt-3 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-[var(--brand)]">{formatPrice(order.total_inr)}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h3 className="serif text-lg mb-3">Shipping</h3>
        <p className="text-sm leading-relaxed">
          {order.shipping_address.line1}{order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ""}<br />
          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
          {order.shipping_address.country}
        </p>
      </div>
    </div>
  );
}
