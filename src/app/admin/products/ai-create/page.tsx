"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductForm } from "@/components/ProductForm";
import type { Product } from "@/types";

const EXAMPLES = [
  `Got a beautiful new banarasi from Salim bhai - deep wine color, gold zari work all over the body and pallu, pure silk, has matching blouse piece, weighs around 700g. He's selling for 16500. Got 3 pieces in stock.`,
  `New arrival: light pink chiffon saree with sequin border, very flowy, perfect for cocktails or sangeet. ₹6800. 5 in stock. Comes with blouse.`,
  `Mustard yellow cotton from Bengal jamdani weavers, white floral motifs, very breathable, daily wear. 2800rs each, got 12 of these.`,
];

export default function AICreatePage() {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Partial<Product> | null>(null);

  async function generate() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setExtracted(null);
    try {
      const res = await fetch("/api/admin/listing-from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          image_url: imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setExtracted(data.listing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setExtracted(null);
    setText("");
    setImageUrl("");
    setError(null);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="serif text-2xl">✨ AI-create a listing</h2>
        <Link href="/admin/products" className="text-sm text-[var(--brand)] hover:underline">
          ← Back to products
        </Link>
      </div>

      {!extracted ? (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-[var(--brand-light)] rounded-xl p-4 text-sm text-[var(--brand-dark)]">
            Paste raw notes about the saree — fabric, color, price, anything you
            know. AI will pull it into a clean listing you can review before
            saving. No need to format anything.
          </div>

          <label className="block">
            <span className="text-xs text-black/60 block mb-1">
              Saree details (free-form)
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Got a new banarasi from Salim bhai today, deep wine color with gold zari, pure silk, ₹16500, blouse included, 3 in stock..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-black/15 focus:border-[var(--brand)] focus:outline-none text-sm leading-relaxed"
            />
          </label>

          <label className="block">
            <span className="text-xs text-black/60 block mb-1">
              Image URL (optional — AI will use it for vision if you provide one)
            </span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-lg border border-black/15 focus:border-[var(--brand)] focus:outline-none text-sm"
            />
            {imageUrl && (
              <div className="mt-3 relative w-32 h-40 rounded-lg overflow-hidden bg-[var(--muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </label>

          <div>
            <p className="text-xs text-black/55 mb-2">Try one of these examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setText(ex)}
                  className="text-xs px-3 py-1.5 rounded-full border border-black/10 hover:border-[var(--brand)] hover:text-[var(--brand)] text-left max-w-md truncate"
                >
                  {ex.slice(0, 60)}…
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={generate}
              disabled={loading || !text.trim()}
              className="btn-primary"
            >
              {loading ? "Generating…" : "✨ Generate listing"}
            </button>
            <Link href="/admin/products/new" className="btn-outline">
              Or fill manually
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-green-900">
                ✓ AI extracted the listing below
              </p>
              <p className="text-sm text-green-800 mt-1">
                Review, tweak any field, then click <strong>Save</strong>. The
                product won&apos;t be created until you save.
              </p>
            </div>
            <button
              onClick={startOver}
              className="text-sm text-green-900 hover:underline shrink-0"
            >
              Start over
            </button>
          </div>

          {extracted.image_url && (
            <div className="relative w-32 h-40 rounded-lg overflow-hidden bg-[var(--muted)]">
              <Image
                src={extracted.image_url}
                alt="extracted"
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          )}

          <ProductForm initial={extracted as Product} />
        </div>
      )}
    </div>
  );
}
