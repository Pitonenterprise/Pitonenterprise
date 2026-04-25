import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { listWishlistProducts } from "@/lib/store";
import { getCurrentUser } from "@/lib/supabase-auth";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/wishlist");

  const products = await listWishlistProducts(user.id);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="serif text-3xl md:text-4xl">Your wishlist</h1>
        <p className="text-sm text-black/55 mt-1">
          {products.length === 0
            ? "Tap the heart on any saree to save it here for later."
            : `${products.length} ${products.length === 1 ? "saree" : "sarees"} saved`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-[var(--muted)] rounded-2xl">
          <div className="text-5xl mb-3">💛</div>
          <p className="text-black/60 mb-5">Your wishlist is empty.</p>
          <Link href="/products" className="btn-primary">
            Browse the collection
          </Link>
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
