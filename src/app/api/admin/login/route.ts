import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const ok = await setAdminCookie(password || "");
  if (!ok) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
