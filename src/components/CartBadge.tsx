"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";

export function CartBadge() {
  const totalItems = useCart((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
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
  );
}
