import Link from "next/link";
import { listProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { ALL_CATEGORIES, ALL_FABRICS, ALL_OCCASIONS } from "@/data/seed-products";

interface SearchParams {
  category?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  min_price?: string;
  max_price?: string;
  search?: string;
}

export default async function ProductsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const products = listProducts({
    category: sp.category,
    fabric: sp.fabric,
    occasion: sp.occasion,
    color: sp.color,
    min_price: sp.min_price ? Number(sp.min_price) : undefined,
    max_price: sp.max_price ? Number(sp.max_price) : undefined,
    search: sp.search,
    in_stock_only: false,
  });

  const buildHref = (key: keyof SearchParams, value: string | undefined) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v && k !== key) params.set(k, v);
    });
    if (value) params.set(key, value);
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  const Chip = ({
    active,
    label,
    href,
  }: {
    active: boolean;
    label: string;
    href: string;
  }) => (
    <Link
      href={href}
      className={`text-xs px-3 py-1.5 rounded-full border transition ${
        active
          ? "bg-[var(--brand)] text-white border-[var(--brand)]"
          : "bg-white border-black/10 hover:border-[var(--brand)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="serif text-3xl md:text-4xl">All Sarees</h1>
        <p className="text-black/60 mt-1">
          {products.length} {products.length === 1 ? "saree" : "sarees"}
          {sp.category ? ` in ${sp.category}` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-wider text-black/50 mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={!sp.category} label="All" href={buildHref("category", undefined)} />
            {ALL_CATEGORIES.map((c) => (
              <Chip key={c} active={sp.category === c} label={c} href={buildHref("category", c)} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-black/50 mb-2">Fabric</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={!sp.fabric} label="All" href={buildHref("fabric", undefined)} />
            {ALL_FABRICS.map((f) => (
              <Chip key={f} active={sp.fabric === f} label={f} href={buildHref("fabric", f)} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-black/50 mb-2">Occasion</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={!sp.occasion} label="All" href={buildHref("occasion", undefined)} />
            {ALL_OCCASIONS.map((o) => (
              <Chip key={o} active={sp.occasion === o} label={o} href={buildHref("occasion", o)} />
            ))}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-black/60">No sarees match those filters.</p>
          <Link href="/products" className="btn-outline mt-5">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
