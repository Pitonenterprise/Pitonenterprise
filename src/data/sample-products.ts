// Temporary sample catalog for the storefront UI. Replaced by Payload `Products`
// data in Phase 1 (see Doc/ROADMAP.md). Images use brand gradient placeholders.

export type SampleProduct = {
  slug: string
  name: string
  category: 'sarees' | 'kurtis' | 'lehengas' | 'western'
  priceUsd: number
  fabric: string
  tag?: string
  swatch: string // CSS background for the placeholder image
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  { slug: 'kanchipuram-wine-silk', name: 'Kanchipuram Wine Silk Saree', category: 'sarees', priceUsd: 189, fabric: 'Pure Silk', tag: 'Bestseller', swatch: 'linear-gradient(145deg,#6e1f3b,#4a1228)' },
  { slug: 'ivory-zari-organza', name: 'Ivory Zari Organza Saree', category: 'sarees', priceUsd: 156, fabric: 'Organza', swatch: 'linear-gradient(145deg,#e8d7b8,#c9b48c)' },
  { slug: 'emerald-banarasi', name: 'Emerald Banarasi Saree', category: 'sarees', priceUsd: 212, fabric: 'Banarasi Silk', tag: 'New', swatch: 'linear-gradient(145deg,#1f5b4a,#123528)' },
  { slug: 'rose-chikankari-kurti', name: 'Rose Chikankari Kurti', category: 'kurtis', priceUsd: 64, fabric: 'Cotton', swatch: 'linear-gradient(145deg,#b86a7a,#7a3a48)' },
  { slug: 'mustard-block-print-kurti', name: 'Mustard Block-Print Kurti', category: 'kurtis', priceUsd: 58, fabric: 'Cotton', tag: 'New', swatch: 'linear-gradient(145deg,#cda14a,#9c7426)' },
  { slug: 'indigo-anarkali-kurti', name: 'Indigo Anarkali Kurti', category: 'kurtis', priceUsd: 72, fabric: 'Rayon', swatch: 'linear-gradient(145deg,#3a4a7a,#23305a)' },
  { slug: 'maroon-velvet-lehenga', name: 'Maroon Velvet Bridal Lehenga', category: 'lehengas', priceUsd: 489, fabric: 'Velvet', tag: 'Bridal', swatch: 'linear-gradient(145deg,#6e1f3b,#3a0f20)' },
  { slug: 'champagne-sequin-lehenga', name: 'Champagne Sequin Lehenga', category: 'lehengas', priceUsd: 432, fabric: 'Net', swatch: 'linear-gradient(145deg,#e8d7b8,#b68a3e)' },
  { slug: 'teal-mirror-lehenga', name: 'Teal Mirror-Work Lehenga', category: 'lehengas', priceUsd: 398, fabric: 'Georgette', swatch: 'linear-gradient(145deg,#1f6e6a,#114240)' },
  { slug: 'noir-draped-gown', name: 'Noir Draped Evening Gown', category: 'western', priceUsd: 168, fabric: 'Crepe', swatch: 'linear-gradient(145deg,#2a2320,#0e0b0a)' },
  { slug: 'blush-slip-dress', name: 'Blush Satin Slip Dress', category: 'western', priceUsd: 124, fabric: 'Satin', tag: 'New', swatch: 'linear-gradient(145deg,#d9b8b0,#a8807a)' },
  { slug: 'olive-co-ord-set', name: 'Olive Linen Co-ord Set', category: 'western', priceUsd: 138, fabric: 'Linen', swatch: 'linear-gradient(145deg,#6a6a3a,#42421f)' },
]

export const CATEGORIES = [
  { slug: 'sarees', label: 'Sarees', blurb: 'Drape in heritage silk' },
  { slug: 'kurtis', label: 'Kurtis', blurb: 'Everyday elegance' },
  { slug: 'lehengas', label: 'Lehengas', blurb: 'For the celebration' },
  { slug: 'western', label: 'Western', blurb: 'Modern silhouettes' },
] as const
