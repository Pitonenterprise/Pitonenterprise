"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { STORE_NAME } from "@/lib/config";

export function Header() {
  const totalItems = useCart((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="border-b border-black/10 bg-[var(--background)]/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="serif text-2xl font-semibold text-[var(--brand)]">
            {STORE_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/products" className="hover:text-[var(--brand)]">
              All Sarees
            </Link>
            <Link href="/products?category=bridal" className="hover:text-[var(--brand)]">
              Bridal
            </Link>
            <Link href="/products?category=festive" className="hover:text-[var(--brand)]">
              Festive
            </Link>
            <Link href="/products?category=casual" className="hover:text-[var(--brand)]">
              Daily Wear
            </Link>
            <Link href="/account" className="hover:text-[var(--brand)]">
              Account
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative px-3 py-2 rounded-full hover:bg-[var(--muted)] text-sm font-medium"
            >
              Cart
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--brand)] text-white text-[11px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
