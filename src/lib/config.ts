export const STORE_NAME =
  process.env.NEXT_PUBLIC_STORE_NAME || "Aaranya Sarees";

export const STORE_WHATSAPP =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP || "+919999999999";

export const DEMO_MODE =
  (process.env.DEMO_MODE || "true").toLowerCase() === "true" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
export const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
