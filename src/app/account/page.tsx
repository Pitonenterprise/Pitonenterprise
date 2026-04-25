import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase-auth";
import { listOrdersForCustomer } from "@/lib/store";
import { formatPrice } from "@/lib/currency";
import type { Order } from "@/types";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const fullName = (user.user_metadata?.full_name as string | undefined) || "";
  const email = user.email || "";
  const orders = email ? await listOrdersForCustomer(email) : [];

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="serif text-3xl">My Account</h1>
          <p className="text-sm text-black/55 mt-1">
            {fullName ? `${fullName} · ` : ""}{email}
          </p>
        </div>
        <form action="/auth/signout" method="POST">
          <button className="text-sm text-black/55 hover:text-[var(--brand)]">
            Sign out
          </button>
        </form>
      </div>

      <h2 className="serif text-xl mb-4">Your orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[var(--muted)] rounded-2xl">
          <p className="text-black/60 mb-4">No orders yet under {email}.</p>
          <Link href="/products" className="btn-primary">Shop Sarees</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-black/5 p-5 hover:border-[var(--brand)] transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-black/55 uppercase tracking-wider">
                    {order.id}
                  </p>
                  <p className="serif text-lg mt-1">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "saree" : "sarees"}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/55">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className="font-semibold text-[var(--brand)]">
                  {formatPrice(order.total_inr)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function statusColor(s: Order["status"]) {
  switch (s) {
    case "delivered": return "bg-green-100 text-green-800";
    case "shipped": return "bg-blue-100 text-blue-800";
    case "cancelled":
    case "returned": return "bg-red-100 text-red-700";
    case "confirmed": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-700";
  }
}
