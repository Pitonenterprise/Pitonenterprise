import Link from "next/link";
import { listOrders } from "@/lib/store";
import { formatPrice } from "@/lib/currency";

export default function AdminOrdersPage() {
  const orders = listOrders();
  return (
    <div>
      <h2 className="serif text-2xl mb-6">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-black/55">No orders yet. Place a test order from the storefront to see it here.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] text-left text-xs uppercase tracking-wider text-black/55">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--muted)]/50">
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:text-[var(--brand)]">
                      {o.id}
                    </Link>
                  </td>
                  <td className="p-3">
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-black/55">{o.customer_email}</div>
                  </td>
                  <td className="p-3">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="p-3 font-semibold">{formatPrice(o.total_inr)}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--brand-light)] text-[var(--brand-dark)]">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-black/60 text-xs">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
