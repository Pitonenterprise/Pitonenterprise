// In-memory data store for DEMO_MODE — backed by seed data, mutated at runtime.
// In production, swap these functions for Supabase queries (the API surface
// is the same shape so calls don't need to change).

import { SEED_PRODUCTS } from "@/data/seed-products";
import type {
  ChatMessage,
  ChatSession,
  Order,
  OrderStatus,
  Product,
} from "@/types";

type Globals = {
  products: Product[];
  orders: Order[];
  chatSessions: Map<string, ChatSession>;
  chatMessages: Map<string, ChatMessage[]>;
};

const globalAny = globalThis as unknown as { __sareeStore?: Globals };

function getStore(): Globals {
  if (!globalAny.__sareeStore) {
    globalAny.__sareeStore = {
      products: [...SEED_PRODUCTS],
      orders: [],
      chatSessions: new Map(),
      chatMessages: new Map(),
    };
  }
  return globalAny.__sareeStore;
}

// ----- Products -----

export interface ProductFilters {
  category?: string;
  fabric?: string;
  color?: string;
  occasion?: string;
  min_price?: number;
  max_price?: number;
  in_stock_only?: boolean;
  search?: string;
  limit?: number;
}

export function listProducts(filters: ProductFilters = {}): Product[] {
  const s = getStore();
  let items = s.products.filter((p) => p.status === "active");

  if (filters.category) {
    items = items.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase(),
    );
  }
  if (filters.fabric) {
    const f = filters.fabric.toLowerCase();
    items = items.filter((p) => p.fabric.toLowerCase().includes(f));
  }
  if (filters.color) {
    const c = filters.color.toLowerCase();
    items = items.filter((p) => p.color.toLowerCase().includes(c));
  }
  if (filters.occasion) {
    const o = filters.occasion.toLowerCase();
    items = items.filter((p) =>
      p.occasion_tags.some((t) => t.toLowerCase().includes(o)),
    );
  }
  if (typeof filters.min_price === "number") {
    items = items.filter((p) => p.price_inr >= filters.min_price!);
  }
  if (typeof filters.max_price === "number") {
    items = items.filter((p) => p.price_inr <= filters.max_price!);
  }
  if (filters.in_stock_only) {
    items = items.filter((p) => p.stock_quantity > 0);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q),
    );
  }
  return filters.limit ? items.slice(0, filters.limit) : items;
}

export function getProductBySlug(slug: string): Product | undefined {
  return getStore().products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return getStore().products.find((p) => p.id === id);
}

export function getProductsByIds(ids: string[]): Product[] {
  const s = getStore();
  return ids
    .map((id) => s.products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export function listAllProductsForAdmin(): Product[] {
  return [...getStore().products].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export function upsertProduct(input: Partial<Product> & { id?: string }) {
  const s = getStore();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = s.products.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      s.products[idx] = { ...s.products[idx], ...input } as Product;
      return s.products[idx];
    }
  }
  const id = input.id || `p_${Math.random().toString(36).slice(2, 8)}`;
  const product: Product = {
    id,
    slug:
      input.slug ||
      (input.name || "untitled")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    name: input.name || "Untitled Saree",
    description: input.description || "",
    price_inr: input.price_inr || 0,
    fabric: input.fabric || "Cotton",
    color: input.color || "",
    category: input.category || "casual",
    occasion_tags: input.occasion_tags || [],
    image_url: input.image_url || "",
    gallery_urls: input.gallery_urls,
    stock_quantity: input.stock_quantity ?? 0,
    status: input.status || "active",
    weave_region: input.weave_region,
    blouse_included: input.blouse_included,
    length_meters: input.length_meters,
    care: input.care,
    created_at: now,
  };
  s.products.unshift(product);
  return product;
}

export function deleteProduct(id: string) {
  const s = getStore();
  s.products = s.products.filter((p) => p.id !== id);
}

// ----- Orders -----

export function listOrders(): Order[] {
  return [...getStore().orders].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export function listOrdersForCustomer(email: string): Order[] {
  return getStore().orders.filter(
    (o) => o.customer_email.toLowerCase() === email.toLowerCase(),
  );
}

export function getOrderById(id: string): Order | undefined {
  return getStore().orders.find((o) => o.id === id);
}

export function createOrder(order: Omit<Order, "id" | "created_at" | "updated_at" | "status"> & { status?: OrderStatus }): Order {
  const s = getStore();
  const now = new Date().toISOString();
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    status: order.status || "pending",
    created_at: now,
    updated_at: now,
  };
  s.orders.unshift(newOrder);
  // Decrement stock
  for (const item of newOrder.items) {
    const p = s.products.find((pr) => pr.id === item.product_id);
    if (p) p.stock_quantity = Math.max(0, p.stock_quantity - item.quantity);
  }
  return newOrder;
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
): Order | undefined {
  const s = getStore();
  const order = s.orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  if (trackingNumber) order.tracking_number = trackingNumber;
  order.updated_at = new Date().toISOString();
  return order;
}

// ----- Chat sessions -----

export function getOrCreateSession(
  sessionId: string | undefined,
  guestId?: string,
): ChatSession {
  const s = getStore();
  if (sessionId && s.chatSessions.has(sessionId)) {
    return s.chatSessions.get(sessionId)!;
  }
  const id = sessionId || `chat_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();
  const session: ChatSession = {
    id,
    guest_session_id: guestId,
    started_at: now,
    last_message_at: now,
    escalated_to_human: false,
    led_to_purchase: false,
  };
  s.chatSessions.set(id, session);
  s.chatMessages.set(id, []);
  return session;
}

export function listSessions(): ChatSession[] {
  return [...getStore().chatSessions.values()].sort((a, b) =>
    b.last_message_at.localeCompare(a.last_message_at),
  );
}

export function getMessages(sessionId: string): ChatMessage[] {
  return getStore().chatMessages.get(sessionId) || [];
}

export function appendMessage(
  sessionId: string,
  msg: Omit<ChatMessage, "id" | "session_id" | "created_at">,
): ChatMessage {
  const s = getStore();
  const message: ChatMessage = {
    id: `msg_${Math.random().toString(36).slice(2, 10)}`,
    session_id: sessionId,
    created_at: new Date().toISOString(),
    ...msg,
  };
  if (!s.chatMessages.has(sessionId)) s.chatMessages.set(sessionId, []);
  s.chatMessages.get(sessionId)!.push(message);
  const session = s.chatSessions.get(sessionId);
  if (session) session.last_message_at = message.created_at;
  return message;
}

export function markEscalated(sessionId: string) {
  const session = getStore().chatSessions.get(sessionId);
  if (session) session.escalated_to_human = true;
}
