"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/currency";

const STORAGE_KEY = "saree-account-email";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedEmail(stored);
      setEmail(stored);
      void load(stored);
    }
  }, []);

  async function load(addr: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders?email=${encodeURIComponent(addr)}`,
      );
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }

  function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem(STORAGE_KEY, email);
    setSavedEmail(email);
    void load(email);
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY);
    setSavedEmail(null);
    setOrders([]);
  }

  if (!savedEmail) {
    return (
      <div className="max-w-md mx-auto px-5 py-20">
        <h1 className="serif text-3xl mb-2">My Account</h1>
        <p className="text-black/60 mb-6 text-sm">
          Enter the email you used at checkout to see your orders.
        </p>
        <form onSubmit={signIn} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg border border-black/15 focus:border-[var(--brand)] focus:outline-none"
          />
          <button type="submit" className="btn-primary w-full">
            Continue
          </button>
        </form>
        <p className="text-xs text-black/45 mt-6">
          Demo mode uses email lookup. In production this is swapped for
          password-protected accounts via Supabase Auth.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="serif text-3xl">My Orders</h1>
          <p className="text-sm text-black/55 mt-1">{savedEmail}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-black/55 hover:text-[var(--brand)]"
        >
          Switch account
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-[var(--muted)] rounded-2xl">
          <p className="text-black/60 mb-4">No orders yet under this email.</p>
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
                <span
                  className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}
                >
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
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
    case "returned":
      return "bg-red-100 text-red-700";
    case "confirmed":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
