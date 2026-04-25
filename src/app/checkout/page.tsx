"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const totalInr = useCart((s) => s.totalInr());
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    setMounted(true);
    // Pre-fill name + email from logged-in user
    void (async () => {
      const { data } = await supabaseBrowser().auth.getUser();
      const user = data.user;
      if (!user) return;
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        name:
          f.name ||
          ((user.user_metadata?.full_name as string | undefined) || ""),
      }));
    })();
  }, []);

  if (!mounted) return null;

  if (items.length === 0 && !submitting) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
        <h1 className="serif text-2xl mb-4">Your cart is empty</h1>
        <Link href="/products" className="btn-primary">Shop Sarees</Link>
      </div>
    );
  }

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country: form.country,
          },
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clear();
      router.push(`/checkout/success?order=${data.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const Input = ({
    label,
    value,
    onChange,
    type = "text",
    required = true,
    full,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
    full?: boolean;
  }) => (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-black/60 block mb-1">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-black/15 focus:border-[var(--brand)] focus:outline-none"
      />
    </label>
  );

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="serif text-3xl md:text-4xl mb-8">Checkout</h1>
      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-[2fr_1fr] gap-10"
      >
        <div className="space-y-6">
          <section>
            <h2 className="serif text-xl mb-4">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.name} onChange={(v) => update("name", v)} />
              <Input label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" />
              <Input label="Phone" value={form.phone} onChange={(v) => update("phone", v)} required={false} />
            </div>
          </section>
          <section>
            <h2 className="serif text-xl mb-4">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Address line 1" value={form.line1} onChange={(v) => update("line1", v)} full />
              <Input label="Address line 2" value={form.line2} onChange={(v) => update("line2", v)} required={false} full />
              <Input label="City" value={form.city} onChange={(v) => update("city", v)} />
              <Input label="State" value={form.state} onChange={(v) => update("state", v)} />
              <Input label="Postal code" value={form.postal_code} onChange={(v) => update("postal_code", v)} />
              <Input label="Country" value={form.country} onChange={(v) => update("country", v)} />
            </div>
          </section>
          <section>
            <h2 className="serif text-xl mb-4">Payment</h2>
            <div className="bg-[var(--muted)] rounded-xl p-4 text-sm text-black/70">
              💳 Demo mode — no payment is taken. In production, integrate
              Razorpay (India) or Stripe (international) here.
            </div>
          </section>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}
        </div>

        <aside className="bg-[var(--muted)] rounded-2xl p-6 h-fit lg:sticky lg:top-24 space-y-4">
          <h2 className="serif text-xl">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.product_id} className="flex justify-between gap-3">
                <span className="text-black/75">
                  {i.product.name}{" "}
                  <span className="text-black/40">× {i.quantity}</span>
                </span>
                <span>{formatPrice(i.product.price_inr * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-black/10 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-[var(--brand)]">{formatPrice(totalInr)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
