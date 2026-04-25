import Image from "next/image";
import Link from "next/link";
import { listAllProductsForAdmin } from "@/lib/store";
import { formatPrice } from "@/lib/currency";

export default async function AdminProductsPage() {
  const products = await listAllProductsForAdmin();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="serif text-2xl">Products ({products.length})</h2>
        <div className="flex gap-3">
          <Link href="/admin/products/ai-create" className="btn-outline">
            ✨ AI Create
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            + Add manually
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)] text-left text-xs uppercase tracking-wider text-black/55">
            <tr>
              <th className="p-3"></th>
              <th className="p-3">Name</th>
              <th className="p-3">Fabric</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--muted)]/50">
                <td className="p-3">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-[var(--muted)]">
                    <Image src={p.image_url} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                </td>
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-[var(--brand)]">
                    {p.name}
                  </Link>
                  <p className="text-xs text-black/45">{p.slug}</p>
                </td>
                <td className="p-3 text-black/70">{p.fabric}</td>
                <td className="p-3">{formatPrice(p.price_inr)}</td>
                <td className={`p-3 font-medium ${p.stock_quantity === 0 ? "text-red-600" : ""}`}>
                  {p.stock_quantity}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-sm text-[var(--brand)] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
