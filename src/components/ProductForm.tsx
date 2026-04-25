"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { ALL_CATEGORIES, ALL_FABRICS, ALL_OCCASIONS } from "@/data/seed-products";

const TRANSPARENCY_OPTIONS = ["", "sheer", "semi-sheer", "opaque"];
const SEASON_OPTIONS = ["", "summer", "winter", "all-season"];
const BORDER_OPTIONS = ["", "plain", "narrow", "broad", "contrast"];

export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    // Identity
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    // Pricing
    price_inr: initial?.price_inr ?? 0,
    mrp_inr: initial?.mrp_inr ?? 0,
    // Color
    color: initial?.color || "",
    secondary_color: initial?.secondary_color || "",
    // Classification
    fabric: initial?.fabric || "Banarasi Silk",
    category: initial?.category || "festive",
    occasion_tags: initial?.occasion_tags?.join(", ") || "",
    // Construction
    weave_pattern: initial?.weave_pattern || "",
    work_type: initial?.work_type?.join(", ") || "",
    border_type: initial?.border_type || "",
    motif_pattern: initial?.motif_pattern || "",
    transparency: initial?.transparency || "",
    // Origin
    weave_region: initial?.weave_region || "",
    weaver_name: initial?.weaver_name || "",
    is_handloom: initial?.is_handloom ?? false,
    silk_mark_certified: initial?.silk_mark_certified ?? false,
    // Dimensions
    length_meters: initial?.length_meters ?? 5.5,
    weight_grams: initial?.weight_grams ?? 0,
    blouse_included: initial?.blouse_included ?? true,
    // Wearability
    season: initial?.season || "",
    // Inventory + media
    stock_quantity: initial?.stock_quantity ?? 0,
    image_url: initial?.image_url || "",
    care: initial?.care || "",
    status: initial?.status || "active",
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
        mrp_inr: Number(form.mrp_inr) || undefined,
        stock_quantity: Number(form.stock_quantity),
        length_meters: Number(form.length_meters),
        weight_grams: Number(form.weight_grams) || undefined,
        occasion_tags: splitCsv(form.occasion_tags),
        work_type: splitCsv(form.work_type),
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
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      <Section title="Basics">
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
      </Section>

      <Section title="Pricing & inventory">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Price (INR)">
            <input type="number" min={0} value={form.price_inr} onChange={(e) => update("price_inr", Number(e.target.value))} className={input} />
          </Field>
          <Field label="MRP (INR, optional)">
            <input type="number" min={0} value={form.mrp_inr} onChange={(e) => update("mrp_inr", Number(e.target.value))} placeholder="0 = no MRP" className={input} />
          </Field>
          <Field label="Stock">
            <input type="number" min={0} value={form.stock_quantity} onChange={(e) => update("stock_quantity", Number(e.target.value))} className={input} />
          </Field>
        </div>
      </Section>

      <Section title="Classification">
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
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Secondary color (border / pallu)">
            <input value={form.secondary_color} onChange={(e) => update("secondary_color", e.target.value)} placeholder="Optional" className={input} />
          </Field>
          <Field label={`Occasion tags (comma-separated, from: ${ALL_OCCASIONS.slice(0, 4).join(", ")}…)`}>
            <input value={form.occasion_tags} onChange={(e) => update("occasion_tags", e.target.value)} className={input} />
          </Field>
        </div>
      </Section>

      <Section title="Construction & craft">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Weave pattern">
            <input value={form.weave_pattern} onChange={(e) => update("weave_pattern", e.target.value)} placeholder="Kadhua, Jamdani, Ikat…" className={input} />
          </Field>
          <Field label="Border type">
            <select value={form.border_type} onChange={(e) => update("border_type", e.target.value)} className={input}>
              {BORDER_OPTIONS.map((b) => <option key={b} value={b}>{b || "—"}</option>)}
            </select>
          </Field>
          <Field label="Transparency">
            <select value={form.transparency} onChange={(e) => update("transparency", e.target.value)} className={input}>
              {TRANSPARENCY_OPTIONS.map((t) => <option key={t} value={t}>{t || "—"}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Work type (comma-separated)">
            <input value={form.work_type} onChange={(e) => update("work_type", e.target.value)} placeholder="Zari, Embroidery, Sequin…" className={input} />
          </Field>
          <Field label="Motif pattern">
            <input value={form.motif_pattern} onChange={(e) => update("motif_pattern", e.target.value)} placeholder="Floral, paisley, peacock…" className={input} />
          </Field>
        </div>
      </Section>

      <Section title="Origin & authenticity">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Weave region">
            <input value={form.weave_region} onChange={(e) => update("weave_region", e.target.value)} placeholder="Varanasi, UP" className={input} />
          </Field>
          <Field label="Weaver name (optional)">
            <input value={form.weaver_name} onChange={(e) => update("weaver_name", e.target.value)} className={input} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_handloom} onChange={(e) => update("is_handloom", e.target.checked)} />
            Handloom certified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.silk_mark_certified} onChange={(e) => update("silk_mark_certified", e.target.checked)} />
            Silk Mark certified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.blouse_included} onChange={(e) => update("blouse_included", e.target.checked)} />
            Blouse piece included
          </label>
        </div>
      </Section>

      <Section title="Dimensions & wearability">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Length (m)">
            <input type="number" step="0.1" value={form.length_meters} onChange={(e) => update("length_meters", Number(e.target.value))} className={input} />
          </Field>
          <Field label="Weight (g, optional)">
            <input type="number" min={0} value={form.weight_grams} onChange={(e) => update("weight_grams", Number(e.target.value))} placeholder="0 = unknown" className={input} />
          </Field>
          <Field label="Season">
            <select value={form.season} onChange={(e) => update("season", e.target.value)} className={input}>
              {SEASON_OPTIONS.map((s) => <option key={s} value={s}>{s || "—"}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Care instructions">
          <input value={form.care} onChange={(e) => update("care", e.target.value)} className={input} />
        </Field>
      </Section>

      <Section title="Media & status">
        <Field label="Image URL">
          <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://…" className={input} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => update("status", e.target.value as Product["status"])} className={input}>
            <option value="active">active</option>
            <option value="draft">draft</option>
            <option value="archived">archived</option>
          </select>
        </Field>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3 pt-4 border-t border-black/10">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        {initial?.id && (
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white border border-black/5 rounded-2xl p-5 space-y-4">
      <legend className="px-2 text-xs uppercase tracking-wider text-black/55 font-medium">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function splitCsv(s: string): string[] {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
