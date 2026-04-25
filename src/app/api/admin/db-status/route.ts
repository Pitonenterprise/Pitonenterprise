import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase";
import { DEMO_MODE } from "@/lib/config";

// Diagnostic-only: tells admin which backend is active and whether the
// expected tables are reachable. Safe to leave in for production debugging.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tables = ["products", "orders", "chat_sessions", "chat_messages"];
  const result: Record<string, { count: number | null; error?: string }> = {};

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      backend: "in-memory",
      demo_mode: DEMO_MODE,
      supabase_configured: false,
      tables: result,
    });
  }

  const sb = supabaseServer();
  for (const t of tables) {
    const { count, error } = await sb
      .from(t)
      .select("*", { count: "exact", head: true });
    result[t] = { count: count ?? null, error: error?.message };
  }

  return NextResponse.json({
    backend: DEMO_MODE ? "in-memory (DEMO_MODE=true)" : "supabase",
    demo_mode: DEMO_MODE,
    supabase_configured: true,
    tables: result,
  });
}
