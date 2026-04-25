import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 max-w-2xl">
        <h2 className="serif text-2xl">Add product</h2>
        <Link href="/admin/products/ai-create" className="text-sm text-[var(--brand)] hover:underline">
          ✨ Use AI to fill this for you →
        </Link>
      </div>
      <ProductForm />
    </div>
  );
}
