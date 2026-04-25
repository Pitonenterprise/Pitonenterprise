"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { ALL_CATEGORIES, ALL_FABRICS, ALL_OCCASIONS } from "@/data/seed-products";

export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    price_inr: initial?.price_inr ?? 0,
    fabric: initial?.fabric || "Banarasi Silk",
    color: initial?.color || "",
    category: initial?.category || "festive",
    occasion_tags: initial?.occasion_tags?.join(", ") || "",
    image_url: initial?.image_url || "",
    stock_quantity: initial?.stock_quantity ?? 0,
    status: initial?.status || "active",
    weave_region: initial?.weave_region || "",
    blouse_included: initial?.blouse_included ?? true,
    length_meters: initial?.length_meters ?? 5.5,
    care: initial?.care || "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        id: initial?.id,
        price_inr: Number(form.price_inr),
        stock_quantity: Number(form.stock_quantity),
        length_meters: Number(form.length_meters),
        occasion_tags: form.occasion_tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products?id=${initial.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" required>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />
        </Field>
        <Field label="Slug (URL)">
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto from name" className={input} />
        </Field>
      </div>
      <Field label="Description">
        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={input} />
      </Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Price (INR)">
          <input type="number" min={0} value={form.price_inr} onChange={(e) => update("price_inr", Number(e.target.value))} className={input} />
        </Field>
        <Field label="Stock">
          <input type="number" min={0} value={form.stock_quantity} onChange={(e) => update("stock_quantity", Number(e.target.value))} className={input} />
        </Field>
        <Field label="Length (m)">
          <input type="number" step="0.1" value={form.length_meters} onChange={(e) => update("length_meters", Number(e.target.value))} className={input} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Fabric">
          <select value={form.fabric} onChange={(e) => update("fabric", e.target.value)} className={input}>
            {ALL_FABRICS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={input}>
            {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Color">
          <input value={form.color} onChange={(e) => update("color", e.target.value)} className={input} />
        </Field>
      </div>
      <Field label={`Occasion tags (comma-separated, e.g. ${ALL_OCCASIONS.slice(0, 3).join(", ")})`}>
        <input value={form.occasion_tags} onChange={(e) => update("occasion_tags", e.target.value)} className={input} />
      </Field>
      <Field label="Image URL">
        <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://…" className={input} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Weave region">
          <input value={form.weave_region} onChange={(e) => update("weave_region", e.target.value)} className={input} />
        </Field>
        <Field label="Care">
          <input value={form.care} onChange={(e) => update("care", e.target.value)} className={input} />
        </Field>
      </div>
      <div className="flex items-center gap-6">
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={form.blouse_included} onChange={(e) => update("blouse_included", e.target.checked)} />
          Blouse included
        </label>
        <Field label="Status">
          <select value={form.status} onChange={(e) => update("status", e.target.value as Product["status"])} className={input}>
            <option value="active">active</option>
            <option value="draft">draft</option>
            <option value="archived">archived</option>
          </select>
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        {initial && (
          <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

const input =
  "w-full px-3 py-2 rounded-lg border border-black/15 focus:border-[var(--brand)] focus:outline-none text-sm";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-black/60 block mb-1">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
