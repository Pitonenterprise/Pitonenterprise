import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deleteProduct, upsertProduct } from "@/lib/store";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const product = upsertProduct(body);
  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
