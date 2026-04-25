import Link from "next/link";
import { listAllProductsForAdmin, listOrders, listSessions } from "@/lib/store";
import { formatPrice } from "@/lib/currency";

export default async function AdminDashboard() {
  const [products, orders, sessions] = await Promise.all([
    listAllProductsForAdmin(),
    listOrders(),
    listSessions(),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.total_inr, 0);
  const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 3);
  const outOfStock = products.filter((p) => p.stock_quantity === 0);

  const Stat = ({ label, value, href }: { label: string; value: string; href?: string }) => {
    const inner = (
      <div className="bg-white rounded-2xl border border-black/5 p-5 hover:border-[var(--brand)] transition">
        <p className="text-xs uppercase tracking-wider text-black/55">{label}</p>
        <p className="serif text-2xl mt-1">{value}</p>
      </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Products" value={products.length.toString()} href="/admin/products" />
        <Stat label="Orders" value={orders.length.toString()} href="/admin/orders" />
        <Stat label="Revenue (INR)" value={formatPrice(totalRevenue)} />
        <Stat label="Chat sessions" value={sessions.length.toString()} href="/admin/chats" />
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <section className="bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="serif text-xl mb-4">Inventory alerts</h2>
          <ul className="space-y-2 text-sm">
            {outOfStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <Link href={`/admin/products/${p.id}`} className="hover:text-[var(--brand)]">
                  {p.name}
                </Link>
                <span className="text-red-600">Out of stock</span>
              </li>
            ))}
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <Link href={`/admin/products/${p.id}`} className="hover:text-[var(--brand)]">
                  {p.name}
                </Link>
                <span className="text-[var(--brand)]">Only {p.stock_quantity} left</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-white rounded-2xl border border-black/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="serif text-xl">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-[var(--brand)]">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-black/55">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 text-sm">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="py-3 flex justify-between">
                <Link href={`/admin/orders/${o.id}`} className="hover:text-[var(--brand)]">
                  <span className="font-mono">{o.id}</span>{" "}
                  <span className="text-black/55">· {o.customer_name}</span>
                </Link>
                <span className="font-semibold text-[var(--brand)]">
                  {formatPrice(o.total_inr)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
