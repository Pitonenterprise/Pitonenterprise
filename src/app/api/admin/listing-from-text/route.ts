import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { OPENAI_API_KEY, OPENAI_MODEL } from "@/lib/config";
import { isAdmin } from "@/lib/admin-auth";
import { listAllProductsForAdmin } from "@/lib/store";
import {
  ALL_CATEGORIES,
  ALL_FABRICS,
  ALL_OCCASIONS,
} from "@/data/seed-products";

const Body = z.object({
  text: z.string().min(20).max(8000),
  image_url: z.string().url().optional().or(z.literal("")),
});

const SYSTEM = `You are a product-listing assistant for a saree boutique. The admin will paste raw, unstructured info about a saree (could be messy notes from a WhatsApp conversation, an email from a weaver, a quick description, etc.). Extract clean, structured listing data.

CORE RULES:
- ONLY use facts present (or strongly implied) in the admin's input or the image. Do NOT fabricate prices, regions, weights, or features.
- If a field is NOT mentioned and cannot be reasonably inferred, return it EMPTY:
  · strings → ""  · numbers → 0  · booleans → false  · arrays → []
  · EXCEPTIONS (sensible defaults the admin would expect):
    – If fabric is silk-family AND care is not mentioned → care = "Dry clean only"
    – If fabric is cotton/linen AND care is not mentioned → care = "Hand wash with mild detergent"
    – Length not mentioned → length_meters = 5.5 (standard)
    – Stock not mentioned → stock_quantity = 1
    – Banarasi → weave_region = "Varanasi, UP"
    – Kanjivaram → weave_region = "Kanchipuram, TN"
    – Patola → weave_region = "Patan, Gujarat"
    – Chanderi → weave_region = "Chanderi, MP"
    – Bandhani → weave_region = "Kutch, Gujarat"
    – Tussar → weave_region = "Bhagalpur, Bihar"
    – Kalamkari → weave_region = "Srikalahasti, AP"
- Write a polished customer-ready 2–4 sentence "description" in good English. Use saree terminology (pallu, zari, drape, blouse piece) where natural. Do NOT plagiarise any existing description in the catalog.
- "fabric" MUST be one of: ${ALL_FABRICS.join(", ")}. Pick closest match.
- "category" MUST be one of: ${ALL_CATEGORIES.join(", ")}. Choose based on price + occasion + style.
- "occasion_tags" MUST come from: ${ALL_OCCASIONS.join(", ")}. 2–4 tags.
- "price_inr" / "mrp_inr" / "weight_grams": integers, no symbols/commas. If only one price is given, set price_inr to it and mrp_inr = 0.
- "transparency": "sheer" | "semi-sheer" | "opaque" | "" (empty if unknown).
- "work_type": array of decoration techniques actually mentioned. Common values: "Zari","Zardozi","Resham","Sequin","Mirror","Stone","Hand-painted","Block print","Embroidery","Print". Empty array if plain.
- "is_handloom" / "silk_mark_certified": true ONLY if explicitly stated. Otherwise false.
- "blouse_included": true unless explicitly stated otherwise (most sarees include unstitched blouse piece).

SEO NAMING RULES (CRITICAL — duplicate names hurt our search rankings):
- The "name" MUST be UNIQUE — it cannot match (case-insensitive) or be a near-duplicate of any name in the AVOID-LIST provided in the user message.
- Pattern: <Distinctive descriptor> <Color> <Fabric/Weave> Saree [<Occasion modifier>]
  Good: "Royal Maroon Banarasi Silk Wedding Saree", "Pastel Pink Chanderi Office Saree"
  Bad: "Maroon Saree", "Banarasi Saree", "Beautiful Saree" (too generic)
- ALWAYS include the literal word "Saree" in the name (English buyers search for it; helps SERP relevance).
- Front-load the most distinctive descriptor (specific shade, motif, or origin) — that's the long-tail keyword that drives ranking.
- Length target: 40–70 characters. Hard ceiling 80.
- Avoid generic stuffing: "Beautiful", "Stunning", "Latest", "Designer" — these are SEO-empty.
- Use natural buyer phrasing — what a real customer would type into Google. e.g. "Crimson Patola Double Ikat Bridal Saree" beats "Saree Patola Crimson".
- "slug": lowercase, hyphen-separated, derived from the name, MUST be unique against the AVOID-LIST slugs.`;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bad request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Fetch existing names + slugs so the AI avoids duplicates (SEO).
  const existing = await listAllProductsForAdmin();
  const avoidList = existing
    .map((p) => `- "${p.name}"  (slug: ${p.slug})`)
    .join("\n");

  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `Admin notes about the saree:\n\n${parsed.data.text}\n\nAVOID-LIST — these names AND slugs already exist in our catalog. Your "name" and "slug" MUST be distinctly different from every entry below (case-insensitive). If your candidate is too close, vary the descriptor (different shade word, motif, occasion modifier, or origin town) until it is unique:\n\n${avoidList || "(catalog is empty — pick the strongest SEO name based on the input)"}\n\nExtract a structured listing. Leave any field empty (or 0/false/[]) when the input doesn't mention it.`,
    },
  ];
  if (parsed.data.image_url) {
    userContent.push({
      type: "image_url",
      image_url: { url: parsed.data.image_url },
    });
  }

  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userContent },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "saree_listing",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            // Identity
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: "string" },
            // Pricing
            price_inr: { type: "integer" },
            mrp_inr: { type: "integer", description: "Original MRP if mentioned, else 0" },
            // Color
            color: { type: "string" },
            secondary_color: { type: "string", description: "Border/pallu accent color, else empty" },
            // Classification
            fabric: { type: "string", enum: ALL_FABRICS },
            category: { type: "string", enum: ALL_CATEGORIES },
            occasion_tags: { type: "array", items: { type: "string", enum: ALL_OCCASIONS } },
            // Construction
            weave_pattern: { type: "string", description: "Kadhua, Jamdani, Ikat, Brocade, Jacquard, etc., else empty" },
            work_type: {
              type: "array",
              items: { type: "string" },
              description: "Decoration techniques: Zari, Zardozi, Resham, Sequin, Mirror, Stone, Hand-painted, Block print, Embroidery, Print",
            },
            border_type: { type: "string", description: "broad / narrow / contrast / plain, else empty" },
            motif_pattern: { type: "string", description: "floral, paisley, peacock, geometric, butis, etc., else empty" },
            transparency: { type: "string", description: "sheer | semi-sheer | opaque | empty" },
            // Origin / authenticity
            weave_region: { type: "string" },
            weaver_name: { type: "string", description: "Only if mentioned, else empty" },
            is_handloom: { type: "boolean" },
            silk_mark_certified: { type: "boolean" },
            // Dimensions
            length_meters: { type: "number" },
            weight_grams: { type: "integer", description: "Saree weight in grams, 0 if unknown" },
            blouse_included: { type: "boolean" },
            // Wearability
            season: { type: "string", description: "summer | winter | all-season | empty" },
            // Inventory + media
            stock_quantity: { type: "integer" },
            care: { type: "string" },
            image_url: { type: "string" },
          },
          required: [
            "name",
            "slug",
            "description",
            "price_inr",
            "mrp_inr",
            "color",
            "secondary_color",
            "fabric",
            "category",
            "occasion_tags",
            "weave_pattern",
            "work_type",
            "border_type",
            "motif_pattern",
            "transparency",
            "weave_region",
            "weaver_name",
            "is_handloom",
            "silk_mark_certified",
            "length_meters",
            "weight_grams",
            "blouse_included",
            "season",
            "stock_quantity",
            "care",
            "image_url",
          ],
        },
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    return NextResponse.json(
      { error: "AI returned empty response" },
      { status: 502 },
    );
  }

  let extracted: Record<string, unknown>;
  try {
    extracted = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "AI returned malformed JSON", raw },
      { status: 502 },
    );
  }

  if (parsed.data.image_url) {
    extracted.image_url = parsed.data.image_url;
  }

  // Server-side uniqueness fallback: if the AI ignored the AVOID-LIST and
  // returned a colliding name/slug, append a distinguishing modifier so we
  // never write a duplicate (which would hurt SEO).
  const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));
  const existingSlugs = new Set(existing.map((p) => p.slug.toLowerCase()));
  let name = String(extracted.name || "").trim();

  if (existingNames.has(name.toLowerCase())) {
    const region = String(extracted.weave_region || "").split(",")[0].trim();
    const motif = String(extracted.motif_pattern || "").trim();
    const candidates = [
      region && `${name} from ${region}`,
      motif && `${name} with ${motif} Motifs`,
    ].filter(Boolean) as string[];
    name =
      candidates.find((c) => !existingNames.has(c.toLowerCase())) || name;
    let n = 2;
    while (existingNames.has(name.toLowerCase())) {
      name = `${name} (Edition ${n++})`;
    }
    extracted.name = name;
  }

  const baseSlug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "saree";
  let finalSlug = baseSlug;
  let s = 2;
  while (existingSlugs.has(finalSlug.toLowerCase())) {
    finalSlug = `${baseSlug}-${s++}`;
  }
  extracted.slug = finalSlug;

  return NextResponse.json({ listing: extracted });
}
