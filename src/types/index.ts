export type Currency = "INR" | "USD" | "GBP" | "AED" | "CAD" | "AUD" | "SGD";

export type ProductStatus = "active" | "draft" | "archived";

export type Category =
  | "bridal"
  | "festive"
  | "party"
  | "casual"
  | "office"
  | "reception";

export type Fabric =
  | "Banarasi Silk"
  | "Kanjivaram Silk"
  | "Pure Silk"
  | "Tussar Silk"
  | "Patola Silk"
  | "Chanderi"
  | "Georgette"
  | "Chiffon"
  | "Cotton"
  | "Linen"
  | "Organza"
  | "Crepe"
  | "Bandhani"
  | "Kalamkari";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_inr: number;
  fabric: Fabric | string;
  color: string;
  category: Category | string;
  occasion_tags: string[];
  image_url: string;
  gallery_urls?: string[];
  stock_quantity: number;
  status: ProductStatus;
  weave_region?: string;
  blouse_included?: boolean;
  length_meters?: number;
  care?: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  status: OrderStatus;
  total_inr: number;
  currency: Currency;
  total_display: number;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  image_url: string;
  quantity: number;
  price_inr: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ChatSession {
  id: string;
  customer_id?: string | null;
  guest_session_id?: string;
  started_at: string;
  last_message_at: string;
  ended_at?: string;
  escalated_to_human: boolean;
  led_to_purchase: boolean;
  order_id?: string;
}

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
  product_ids_recommended?: string[];
  metadata?: Record<string, unknown>;
}
