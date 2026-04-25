import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { OPENAI_API_KEY, OPENAI_MODEL } from "@/lib/config";
import { isAdmin } from "@/lib/admin-auth";
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
- Write a polished customer-ready 2–4 sentence "description" in good English. Use saree terminology (pallu, zari, drape, blouse piece) where natural.
- "fabric" MUST be one of: ${ALL_FABRICS.join(", ")}. Pick closest match.
- "category" MUST be one of: ${ALL_CATEGORIES.join(", ")}. Choose based on price + occasion + style.
- "occasion_tags" MUST come from: ${ALL_OCCASIONS.join(", ")}. 2–4 tags.
- "slug" lowercase + hyphenated, derived from name.
- "price_inr" / "mrp_inr" / "weight_grams": integers, no symbols/commas. If only one price is given, set price_inr to it and mrp_inr = 0.
- "transparency": "sheer" | "semi-sheer" | "opaque" | "" (empty if unknown).
- "work_type": array of decoration techniques actually mentioned. Common values: "Zari","Zardozi","Resham","Sequin","Mirror","Stone","Hand-painted","Block print","Embroidery","Print". Empty array if plain.
- "is_handloom" / "silk_mark_certified": true ONLY if explicitly stated. Otherwise false.
- "blouse_included": true unless explicitly stated otherwise (most sarees include unstitched blouse piece).`;

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

  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `Admin notes about the saree:\n\n${parsed.data.text}\n\nExtract a structured listing. Leave any field empty (or 0/false/[]) when the input doesn't mention it.`,
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

  return NextResponse.json({ listing: extracted });
}
