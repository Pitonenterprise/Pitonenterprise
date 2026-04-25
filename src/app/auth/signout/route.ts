import { NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabase-auth";

export async function POST(req: Request) {
  const sb = await supabaseAuth();
  await sb.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
