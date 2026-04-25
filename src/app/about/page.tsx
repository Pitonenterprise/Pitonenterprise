import { STORE_NAME } from "@/lib/config";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 prose prose-neutral">
      <h1 className="serif text-4xl text-[var(--brand-dark)]">About {STORE_NAME}</h1>
      <p className="text-black/70 mt-4 text-lg leading-relaxed">
        {STORE_NAME} is a small, family-run boutique that brings handwoven sarees
        from India&apos;s best looms to your doorstep — wherever in the world that may be.
        Every saree we sell is sourced directly from weavers, with full transparency
        on origin, fabric, and craft.
      </p>

      <h2 id="shipping" className="serif text-2xl mt-10">Shipping</h2>
      <p className="text-black/70">
        India: 3–5 business days, free shipping above ₹3,000. International:
        10–14 business days via DHL/FedEx. Customs/duties (if any) are
        the buyer&apos;s responsibility — we declare accurately.
      </p>

      <h2 id="returns" className="serif text-2xl mt-10">Returns</h2>
      <p className="text-black/70">
        7-day easy returns from delivery. Saree must be unused with original
        packaging. Custom-stitched blouses are non-returnable. Refunds processed
        within 5 business days of receiving the return.
      </p>
    </div>
  );
}
