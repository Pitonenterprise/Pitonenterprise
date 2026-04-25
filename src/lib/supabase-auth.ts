// Server-side Supabase client with cookie-based auth.
// Used in server components, route handlers, and the middleware to
// read the logged-in user and refresh tokens.

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/config";

export async function supabaseAuth() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — that's fine, middleware
          // will refresh on the next request.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const sb = await supabaseAuth();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}
