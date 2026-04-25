import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, getProductById } from "@/lib/store";
import { convertFromInr } from "@/lib/currency";
import { getCurrentUser } from "@/lib/supabase-auth";
import type { Currency, OrderItem } from "@/types";

const Schema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().optional(),
  currency: z.string().optional(),
  shipping_address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z
    .array(
      z.object({ product_id: z.string(), quantity: z.number().int().min(1) }),
    )
    .min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { customer_name, customer_email, customer_phone, shipping_address, items } =
    parsed.data;
  const currency = (parsed.data.currency || "INR") as Currency;

  const orderItems: OrderItem[] = [];
  let totalInr = 0;
  for (const item of items) {
    const product = await getProductById(item.product_id);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${item.product_id}` },
        { status: 400 },
      );
    }
    if (product.stock_quantity < item.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for ${product.name}` },
        { status: 400 },
      );
    }
    totalInr += product.price_inr * item.quantity;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      image_url: product.image_url,
      quantity: item.quantity,
      price_inr: product.price_inr,
    });
  }

  const user = await getCurrentUser().catch(() => null);

  const order = await createOrder({
    user_id: user?.id ?? null,
    customer_name,
    customer_email,
    customer_phone,
    total_inr: totalInr,
    currency,
    total_display: Number(convertFromInr(totalInr, currency).toFixed(2)),
    shipping_address,
    items: orderItems,
  });

  return NextResponse.json({ order });
}
