import { notFound } from "next/navigation";
import { getProductById } from "@/lib/store";
import { ProductForm } from "@/components/ProductForm";

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = getProductById(id);
  if (!product) notFound();
  return (
    <div>
      <h2 className="serif text-2xl mb-6">Edit product</h2>
      <ProductForm initial={product} />
    </div>
  );
}
