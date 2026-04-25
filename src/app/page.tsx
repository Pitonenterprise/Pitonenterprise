import Link from "next/link";
import Image from "next/image";
import { listProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { STORE_NAME } from "@/lib/config";

export default async function Home() {
  const all = await listProducts({ in_stock_only: true });
  const featured = all.slice(0, 8);
  const bridalAll = await listProducts({ category: "bridal", in_stock_only: true });
  const bridal = bridalAll.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[var(--brand-light)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm tracking-widest uppercase text-[var(--brand)] font-medium mb-3">
              Handwoven · Authentic · Worldwide Shipping
            </p>
            <h1 className="serif text-4xl md:text-6xl leading-tight text-[var(--brand-dark)]">
              Sarees that carry stories from India&apos;s finest looms.
            </h1>
            <p className="mt-5 text-black/70 text-lg max-w-md">
              From Banarasi silk to Patola ikat — sourced directly from weavers, delivered to your door.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/products" className="btn-primary">Shop the Collection</Link>
              <Link href="/products?category=bridal" className="btn-outline">Bridal Edit</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80"
              alt={`${STORE_NAME} hero`}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-black/5 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div><strong className="block">Pure Authenticity</strong><span className="text-black/60">Direct from weavers</span></div>
          <div><strong className="block">Worldwide Shipping</strong><span className="text-black/60">10–14 days international</span></div>
          <div><strong className="block">Easy Returns</strong><span className="text-black/60">7-day return window</span></div>
          <div><strong className="block">Live AI Help</strong><span className="text-black/60">Saree Assistant 24/7</span></div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="serif text-3xl md:text-4xl">Featured Sarees</h2>
          <Link href="/products" className="text-sm text-[var(--brand)] hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Bridal */}
      <section className="bg-[var(--muted)] py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm tracking-widest uppercase text-[var(--brand)] font-medium mb-2">The Bridal Edit</p>
              <h2 className="serif text-3xl md:text-4xl">For your special day</h2>
            </div>
            <Link href="/products?category=bridal" className="text-sm text-[var(--brand)] hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {bridal.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* AI assistant CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="text-sm tracking-widest uppercase text-[var(--brand)] font-medium mb-3">
          Not sure what to pick?
        </p>
        <h2 className="serif text-3xl md:text-4xl max-w-2xl mx-auto">
          Chat with our Saree Assistant — like having a boutique owner in your pocket.
        </h2>
        <p className="mt-4 text-black/60 max-w-xl mx-auto">
          Ask about fabrics, find sarees by occasion or budget, get styling tips, or track your order. Available 24/7.
        </p>
      </section>
    </div>
  );
}
