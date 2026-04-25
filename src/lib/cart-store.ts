"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Currency, Product } from "@/types";

interface CartState {
  items: CartItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalInr: () => number;
  totalItems: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      currency: "INR",
      setCurrency: (currency) => set({ currency }),
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { product_id: product.id, product, quantity: qty },
            ],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product_id === productId ? { ...i, quantity: qty } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalInr: () =>
        get().items.reduce((sum, i) => sum + i.product.price_inr * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "saree-cart",
      partialize: (state) => ({ items: state.items, currency: state.currency }),
    },
  ),
);
