"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";
import { useEffect, useState } from "react";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const totalInr = useCart((s) => s.totalInr());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
        <h1 className="serif text-3xl mb-3">Your cart is empty</h1>
        <p className="text-black/60 mb-6">
          Browse the collection and add a few sarees you love.
        </p>
        <Link href="/products" className="btn-primary">Shop Sarees</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="serif text-3xl md:text-4xl mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 bg-white rounded-2xl border border-black/5 p-4"
            >
              <Link
                href={`/products/${item.product.slug}`}
                className="relative w-24 h-32 rounded-lg overflow-hidden bg-[var(--muted)] shrink-0"
              >
                <Image
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>
              <div className="flex-1 flex flex-col">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="serif text-lg hover:text-[var(--brand)]"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-black/55 mt-0.5">
                  {item.product.fabric} · {item.product.color}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center border border-black/15 rounded-full">
                    <button
                      onClick={() => setQty(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.product_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-[var(--brand)]">
                    {formatPrice(item.product.price_inr * item.quantity)}
                  </p>
                </div>
                <button
                  onClick={() => remove(item.product_id)}
                  className="text-xs text-black/50 hover:text-[var(--brand)] mt-2 self-start"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-[var(--muted)] rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="serif text-xl mb-4">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(totalInr)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>Calculated at checkout</dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 mt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold text-[var(--brand)]">
                {formatPrice(totalInr)}
              </dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn-primary block mt-6 text-center">
            Checkout
          </Link>
          <Link href="/products" className="block mt-3 text-center text-sm text-[var(--brand)] hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
