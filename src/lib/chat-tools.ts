// Server-side handlers for Claude tool calls in the saree chatbot.

import {
  getOrderById,
  getProductById,
  listProducts,
  markEscalated,
} from "@/lib/store";
import { STORE_WHATSAPP } from "@/lib/config";

type ToolInput = Record<string, unknown>;

export interface ToolResult {
  result: unknown;
  product_ids?: string[];
  escalate?: { whatsapp_url: string; reason: string };
}

export async function runTool(
  name: string,
  input: ToolInput,
  sessionId: string,
): Promise<ToolResult> {
  switch (name) {
    case "search_products":
      return searchProducts(input);
    case "get_product_details":
      return getProductDetails(input);
    case "get_order_status":
      return getOrderStatus(input);
    case "escalate_to_human":
      return escalateToHuman(input, sessionId);
    default:
      return { result: { error: `Unknown tool: ${name}` } };
  }
}

function searchProducts(input: ToolInput): ToolResult {
  const products = listProducts({
    category: input.category as string | undefined,
    fabric: input.fabric as string | undefined,
    color: input.color as string | undefined,
    occasion: input.occasion as string | undefined,
    min_price: input.min_price as number | undefined,
    max_price: input.max_price as number | undefined,
    in_stock_only: (input.in_stock_only as boolean) ?? true,
    limit: 5,
  });

  return {
    result: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price_inr: p.price_inr,
      fabric: p.fabric,
      color: p.color,
      category: p.category,
      occasion_tags: p.occasion_tags,
      stock_quantity: p.stock_quantity,
      url: `/products/${p.slug}`,
    })),
    product_ids: products.map((p) => p.id),
  };
}

function getProductDetails(input: ToolInput): ToolResult {
  const id = input.product_id as string;
  const product = getProductById(id);
  if (!product) return { result: { error: "Product not found" } };
  return {
    result: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price_inr: product.price_inr,
      fabric: product.fabric,
      color: product.color,
      category: product.category,
      occasion_tags: product.occasion_tags,
      weave_region: product.weave_region,
      blouse_included: product.blouse_included,
      length_meters: product.length_meters,
      care: product.care,
      stock_quantity: product.stock_quantity,
      url: `/products/${product.slug}`,
    },
    product_ids: [product.id],
  };
}

function getOrderStatus(input: ToolInput): ToolResult {
  const orderId = (input.order_id as string)?.trim();
  const email = ((input.customer_email as string) || "").toLowerCase().trim();
  const order = getOrderById(orderId);
  if (!order || order.customer_email.toLowerCase() !== email) {
    return {
      result: {
        error:
          "We couldn't find an order with that ID + email combination. Could you double-check the email used at checkout?",
      },
    };
  }
  return {
    result: {
      id: order.id,
      status: order.status,
      tracking_number: order.tracking_number || null,
      placed_at: order.created_at,
      items: order.items.map((i) => ({
        name: i.product_name,
        quantity: i.quantity,
      })),
      shipping_city: order.shipping_address.city,
      shipping_country: order.shipping_address.country,
    },
  };
}

function escalateToHuman(input: ToolInput, sessionId: string): ToolResult {
  const reason = (input.reason as string) || "Customer requested human help";
  const summary = (input.conversation_summary as string) || "";
  markEscalated(sessionId);

  const message = `Hi! I was just chatting with the Saree Assistant. ${summary}\n\n(Reason: ${reason})`;
  const number = STORE_WHATSAPP.replace(/[^\d]/g, "");
  const whatsapp_url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return {
    result: {
      ok: true,
      message:
        "I've prepared a WhatsApp link for you to continue with our team. Tap the button to message us directly.",
      whatsapp_url,
    },
    escalate: { whatsapp_url, reason },
  };
}
