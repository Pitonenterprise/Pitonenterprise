import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";

export async function POST(req: Request) {
  await clearAdminCookie();
  return NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
}
