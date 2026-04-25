import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "@/lib/config";

let _server: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service-role key.
 * BYPASSES Row-Level Security — only use in server code (route handlers,
 * server components, server actions). Never import from a Client Component.
 */
export function supabaseServer(): SupabaseClient {
  if (_server) return _server;
  if (!SUPABASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL not set — cannot create Supabase client.",
    );
  }
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or fallback ANON key) not set.",
    );
  }
  _server = createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _server;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY),
  );
}
