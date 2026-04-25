import type { Product } from "@/types";

// Empty by default — store starts blank. Use the admin "✨ AI Create" flow
// (or "+ Add manually") to add real products.
export const SEED_PRODUCTS: Product[] = [];

// These constants drive UI dropdowns AND the AI extractor's strict-output
// enums, so keep them populated even when SEED_PRODUCTS is empty.
export const ALL_OCCASIONS = [
  "wedding",
  "reception",
  "festive",
  "party",
  "cocktail",
  "sangeet",
  "engagement",
  "haldi",
  "navratri",
  "puja",
  "daily",
  "office",
];

export const ALL_FABRICS = [
  "Banarasi Silk",
  "Kanjivaram Silk",
  "Patola Silk",
  "Tussar Silk",
  "Chanderi",
  "Georgette",
  "Chiffon",
  "Cotton",
  "Linen",
  "Organza",
  "Bandhani",
  "Kalamkari",
];

export const ALL_CATEGORIES = [
  "bridal",
  "reception",
  "festive",
  "party",
  "office",
  "casual",
];
