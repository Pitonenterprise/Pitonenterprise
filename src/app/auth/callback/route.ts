// Handles the redirect that lands when a user clicks the email
// confirmation link Supabase sends after sign-up. Exchanges the
// short-lived `code` for a session cookie, then bounces them
// to the next URL (defaults to /account).

import { NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabase-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";

  if (code) {
    const sb = await supabaseAuth();
    await sb.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, req.url));
}
