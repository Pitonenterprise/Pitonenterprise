// Unified async data store. Backed by Supabase when DEMO_MODE=false and
// Supabase env is configured; falls back to in-memory seed data otherwise.
//
// All exported functions are async — even in DEMO mode — so callers don't
// have to know which backend they're hitting.

import { SEED_PRODUCTS } from "@/data/seed-products";
import { DEMO_MODE } from "@/lib/config";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase";
import type {
  ChatMessage,
  ChatRole,
  ChatSession,
  Order,
  OrderStatus,
  Product,
} from "@/types";

const useSupabase = !DEMO_MODE && isSupabaseConfigured();

// ============================================================
// In-memory store (DEMO mode)
// ============================================================

type MemStore = {
  products: Product[];
  orders: Order[];
  chatSessions: Map<string, ChatSession>;
  chatMessages: Map<string, ChatMessage[]>;
};

const globalAny = globalThis as unknown as { __sareeStore?: MemStore };

function mem(): MemStore {
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

// ============================================================
// Filters
// ============================================================

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

// ============================================================
// Products
// ============================================================

export async function listProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  if (useSupabase) {
    let q = supabaseServer().from("products").select("*").eq("status", "active");
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.fabric) q = q.ilike("fabric", `%${filters.fabric}%`);
    if (filters.color) q = q.ilike("color", `%${filters.color}%`);
    if (filters.occasion) q = q.contains("occasion_tags", [filters.occasion]);
    if (typeof filters.min_price === "number") q = q.gte("price_inr", filters.min_price);
    if (typeof filters.max_price === "number") q = q.lte("price_inr", filters.max_price);
    if (filters.in_stock_only) q = q.gt("stock_quantity", 0);
    if (filters.search) {
      const s = filters.search;
      q = q.or(
        `name.ilike.%${s}%,description.ilike.%${s}%,fabric.ilike.%${s}%,color.ilike.%${s}%`,
      );
    }
    if (filters.limit) q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as Product[];
  }

  // In-memory
  let items = mem().products.filter((p) => p.status === "active");
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

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (useSupabase) {
    const { data } = await supabaseServer()
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Product) || undefined;
  }
  return mem().products.find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (useSupabase) {
    const { data } = await supabaseServer()
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Product) || undefined;
  }
  return mem().products.find((p) => p.id === id);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  if (useSupabase) {
    const { data } = await supabaseServer()
      .from("products")
      .select("*")
      .in("id", ids);
    return (data || []) as Product[];
  }
  const s = mem();
  return ids
    .map((id) => s.products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export async function listAllProductsForAdmin(): Promise<Product[]> {
  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Product[];
  }
  return [...mem().products].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export async function upsertProduct(
  input: Partial<Product> & { id?: string },
): Promise<Product> {
  const now = new Date().toISOString();
  const id = input.id || `p_${Math.random().toString(36).slice(2, 8)}`;
  const slug =
    input.slug ||
    (input.name || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  if (useSupabase) {
    const row = {
      id,
      slug,
      name: input.name || "Untitled Saree",
      description: input.description || "",
      price_inr: input.price_inr || 0,
      mrp_inr: input.mrp_inr ?? null,
      color: input.color || "",
      secondary_color: input.secondary_color ?? null,
      fabric: input.fabric || "Cotton",
      category: input.category || "casual",
      occasion_tags: input.occasion_tags || [],
      weave_pattern: input.weave_pattern ?? null,
      work_type: input.work_type || [],
      border_type: input.border_type ?? null,
      motif_pattern: input.motif_pattern ?? null,
      transparency: input.transparency ?? null,
      weave_region: input.weave_region ?? null,
      weaver_name: input.weaver_name ?? null,
      is_handloom: input.is_handloom ?? false,
      silk_mark_certified: input.silk_mark_certified ?? false,
      length_meters: input.length_meters ?? 5.5,
      weight_grams: input.weight_grams ?? null,
      blouse_included: input.blouse_included ?? true,
      season: input.season ?? null,
      image_url: input.image_url || "",
      stock_quantity: input.stock_quantity ?? 0,
      status: input.status || "active",
      care: input.care ?? null,
    };
    const { data, error } = await supabaseServer()
      .from("products")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return data as Product;
  }

  const s = mem();
  if (input.id) {
    const idx = s.products.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      s.products[idx] = { ...s.products[idx], ...input } as Product;
      return s.products[idx];
    }
  }
  const product: Product = {
    id,
    slug,
    name: input.name || "Untitled Saree",
    description: input.description || "",
    price_inr: input.price_inr || 0,
    mrp_inr: input.mrp_inr,
    fabric: input.fabric || "Cotton",
    color: input.color || "",
    secondary_color: input.secondary_color,
    category: input.category || "casual",
    occasion_tags: input.occasion_tags || [],
    image_url: input.image_url || "",
    gallery_urls: input.gallery_urls,
    stock_quantity: input.stock_quantity ?? 0,
    status: input.status || "active",
    weave_region: input.weave_region,
    weaver_name: input.weaver_name,
    is_handloom: input.is_handloom,
    silk_mark_certified: input.silk_mark_certified,
    weave_pattern: input.weave_pattern,
    work_type: input.work_type,
    border_type: input.border_type,
    motif_pattern: input.motif_pattern,
    transparency: input.transparency,
    length_meters: input.length_meters,
    weight_grams: input.weight_grams,
    blouse_included: input.blouse_included,
    season: input.season,
    care: input.care,
    created_at: now,
  };
  s.products.unshift(product);
  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  if (useSupabase) {
    await supabaseServer().from("products").delete().eq("id", id);
    return;
  }
  const s = mem();
  s.products = s.products.filter((p) => p.id !== id);
}

// ============================================================
// Orders
// ============================================================

export async function listOrders(): Promise<Order[]> {
  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Order[];
  }
  return [...mem().orders].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export async function listOrdersForCustomer(email: string): Promise<Order[]> {
  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("orders")
      .select("*")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Order[];
  }
  return mem().orders.filter(
    (o) => o.customer_email.toLowerCase() === email.toLowerCase(),
  );
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (useSupabase) {
    const { data } = await supabaseServer()
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Order) || undefined;
  }
  return mem().orders.find((o) => o.id === id);
}

export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at" | "status"> & {
    status?: OrderStatus;
  },
): Promise<Order> {
  const now = new Date().toISOString();
  const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const newOrder: Order = {
    ...order,
    id,
    status: order.status || "pending",
    created_at: now,
    updated_at: now,
  };

  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("orders")
      .insert({
        id: newOrder.id,
        user_id: newOrder.user_id ?? null,
        customer_email: newOrder.customer_email,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone ?? null,
        status: newOrder.status,
        total_inr: newOrder.total_inr,
        currency: newOrder.currency,
        total_display: newOrder.total_display,
        shipping_address: newOrder.shipping_address,
        items: newOrder.items,
        tracking_number: newOrder.tracking_number ?? null,
        notes: newOrder.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    // Decrement stock atomically (RPC would be safer; this is a best-effort)
    for (const item of newOrder.items) {
      const prod = await getProductById(item.product_id);
      if (prod) {
        await supabaseServer()
          .from("products")
          .update({ stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) })
          .eq("id", item.product_id);
      }
    }
    return data as Order;
  }

  const s = mem();
  s.orders.unshift(newOrder);
  for (const item of newOrder.items) {
    const p = s.products.find((pr) => pr.id === item.product_id);
    if (p) p.stock_quantity = Math.max(0, p.stock_quantity - item.quantity);
  }
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<Order | undefined> {
  if (useSupabase) {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (trackingNumber) updates.tracking_number = trackingNumber;
    const { data } = await supabaseServer()
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return (data as Order) || undefined;
  }
  const s = mem();
  const order = s.orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  if (trackingNumber) order.tracking_number = trackingNumber;
  order.updated_at = new Date().toISOString();
  return order;
}

// ============================================================
// Chat sessions
// ============================================================

export async function getOrCreateSession(
  sessionId: string | undefined,
  guestId?: string,
): Promise<ChatSession> {
  if (useSupabase) {
    if (sessionId) {
      const { data } = await supabaseServer()
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      if (data) return data as ChatSession;
    }
    const id = sessionId || `chat_${Math.random().toString(36).slice(2, 10)}`;
    const { data, error } = await supabaseServer()
      .from("chat_sessions")
      .insert({ id, guest_session_id: guestId ?? null })
      .select("*")
      .single();
    if (error) throw error;
    return data as ChatSession;
  }

  const s = mem();
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

export async function listSessions(): Promise<ChatSession[]> {
  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("chat_sessions")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (error) throw error;
    return (data || []) as ChatSession[];
  }
  return [...mem().chatSessions.values()].sort((a, b) =>
    b.last_message_at.localeCompare(a.last_message_at),
  );
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []) as ChatMessage[];
  }
  return mem().chatMessages.get(sessionId) || [];
}

export async function appendMessage(
  sessionId: string,
  msg: {
    role: ChatRole;
    content: string;
    product_ids_recommended?: string[];
    metadata?: Record<string, unknown>;
  },
): Promise<ChatMessage> {
  const id = `msg_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();

  if (useSupabase) {
    const { data, error } = await supabaseServer()
      .from("chat_messages")
      .insert({
        id,
        session_id: sessionId,
        role: msg.role,
        content: msg.content,
        product_ids_recommended: msg.product_ids_recommended ?? null,
        metadata: msg.metadata ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    // Bump session last_message_at
    await supabaseServer()
      .from("chat_sessions")
      .update({ last_message_at: now })
      .eq("id", sessionId);
    return data as ChatMessage;
  }

  const s = mem();
  const message: ChatMessage = {
    id,
    session_id: sessionId,
    created_at: now,
    role: msg.role,
    content: msg.content,
    product_ids_recommended: msg.product_ids_recommended,
    metadata: msg.metadata,
  };
  if (!s.chatMessages.has(sessionId)) s.chatMessages.set(sessionId, []);
  s.chatMessages.get(sessionId)!.push(message);
  const session = s.chatSessions.get(sessionId);
  if (session) session.last_message_at = message.created_at;
  return message;
}

// ============================================================
// Wishlists  (DB-only — guests have no wishlist; sign in required)
// ============================================================

export async function listWishlistProducts(userId: string): Promise<Product[]> {
  if (!useSupabase) return [];
  const { data: rows, error } = await supabaseServer()
    .from("wishlists")
    .select("product_id, added_at, products(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error) throw error;
  type Row = { product_id: string; products: Product | Product[] | null };
  return (rows as unknown as Row[])
    .map((r) => (Array.isArray(r.products) ? r.products[0] : r.products))
    .filter((p): p is Product => Boolean(p));
}

export async function listWishlistIds(userId: string): Promise<string[]> {
  if (!useSupabase) return [];
  const { data, error } = await supabaseServer()
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((r: { product_id: string }) => r.product_id);
}

export async function addToWishlist(
  userId: string,
  productId: string,
): Promise<void> {
  if (!useSupabase) return;
  await supabaseServer()
    .from("wishlists")
    .upsert(
      { user_id: userId, product_id: productId },
      { onConflict: "user_id,product_id" },
    );
}

export async function removeFromWishlist(
  userId: string,
  productId: string,
): Promise<void> {
  if (!useSupabase) return;
  await supabaseServer()
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
}

export async function markEscalated(sessionId: string): Promise<void> {
  if (useSupabase) {
    await supabaseServer()
      .from("chat_sessions")
      .update({ escalated_to_human: true })
      .eq("id", sessionId);
    return;
  }
  const session = mem().chatSessions.get(sessionId);
  if (session) session.escalated_to_human = true;
}
