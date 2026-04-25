"use client";

import { create } from "zustand";

interface WishlistState {
  ids: Set<string>;
  authed: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<{ added: boolean; needsAuth: boolean }>;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: new Set<string>(),
  authed: false,
  loaded: false,

  load: async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      set({
        ids: new Set<string>(data.ids || []),
        authed: Boolean(data.authed),
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  has: (id) => get().ids.has(id),

  toggle: async (id) => {
    const { ids } = get();
    const isIn = ids.has(id);
    // Optimistic update
    const next = new Set(ids);
    if (isIn) next.delete(id);
    else next.add(id);
    set({ ids: next });

    try {
      const res = await fetch(
        isIn ? `/api/wishlist?product_id=${id}` : "/api/wishlist",
        {
          method: isIn ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: isIn ? undefined : JSON.stringify({ product_id: id }),
        },
      );
      if (res.status === 401) {
        // Roll back optimistic change
        set({ ids });
        return { added: false, needsAuth: true };
      }
      if (!res.ok) {
        set({ ids });
        return { added: false, needsAuth: false };
      }
      return { added: !isIn, needsAuth: false };
    } catch {
      set({ ids });
      return { added: false, needsAuth: false };
    }
  },
}));
