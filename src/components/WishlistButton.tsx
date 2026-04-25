"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/wishlist-store";

export function WishlistButton({
  productId,
  variant = "icon",
}: {
  productId: string;
  variant?: "icon" | "pill";
}) {
  const router = useRouter();
  const load = useWishlist((s) => s.load);
  const has = useWishlist((s) => s.has(productId));
  const loaded = useWishlist((s) => s.loaded);
  const toggle = useWishlist((s) => s.toggle);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const { needsAuth, added } = await toggle(productId);
    setBusy(false);
    if (needsAuth) {
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setFlash(added ? "Saved" : "Removed");
    setTimeout(() => setFlash(null), 1200);
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        className={`btn-outline flex items-center gap-2 ${has ? "bg-[var(--brand)] text-white" : ""}`}
        aria-label={has ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart filled={has} />
        {flash || (has ? "Saved" : "Save to wishlist")}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      title={has ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={has ? "Remove from wishlist" : "Add to wishlist"}
      className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center transition shadow-sm ${
        has
          ? "bg-[var(--brand)] text-white"
          : "bg-white/90 text-black/60 hover:text-[var(--brand)] hover:bg-white"
      }`}
    >
      <Heart filled={has} />
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
