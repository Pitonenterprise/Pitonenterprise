import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, listProducts } from "@/lib/store";
import { formatPrice } from "@/lib/currency";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductDetail(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = listProducts({
    category: product.category,
    in_stock_only: true,
  })
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <nav className="text-sm text-black/60 mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:underline">Sarees</Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-[4/5] bg-[var(--muted)] rounded-2xl overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--brand)] font-medium">
            {product.fabric}
            {product.weave_region ? ` · ${product.weave_region}` : ""}
          </p>
          <h1 className="serif text-3xl md:text-4xl mt-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-[var(--brand)] mt-3">
            {formatPrice(product.price_inr)}
            <span className="text-sm text-black/40 font-normal ml-2">incl. taxes</span>
          </p>

          <div className="mt-6 text-black/75 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-black/50">Color</dt><dd>{product.color}</dd></div>
            <div><dt className="text-black/50">Length</dt><dd>{product.length_meters ?? 5.5} m</dd></div>
            <div><dt className="text-black/50">Blouse</dt><dd>{product.blouse_included ? "Included (unstitched)" : "Not included"}</dd></div>
            <div><dt className="text-black/50">Care</dt><dd>{product.care || "—"}</dd></div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.occasion_tags.map((t) => (
              <Link
                key={t}
                href={`/products?occasion=${t}`}
                className="text-xs px-3 py-1 rounded-full bg-[var(--brand-light)] text-[var(--brand-dark)]"
              >
                {t}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <p className="mt-5 text-xs text-black/55 leading-relaxed">
            ✓ Worldwide shipping in 10–14 days · ✓ 7-day easy returns · ✓ Quality guaranteed
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="serif text-2xl mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
