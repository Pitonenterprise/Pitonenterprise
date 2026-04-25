import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase-auth";
import {
  addToWishlist,
  listWishlistIds,
  removeFromWishlist,
} from "@/lib/store";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

// GET → returns the current user's wishlist product IDs (lightweight)
export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ids: [], authed: false });
  }
  const ids = await listWishlistIds(user.id);
  return NextResponse.json({ ids, authed: true });
}

const PostBody = z.object({ product_id: z.string().min(1) });

// POST { product_id } → add
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to save items to your wishlist" },
      { status: 401 },
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = PostBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  await addToWishlist(user.id, parsed.data.product_id);
  return NextResponse.json({ ok: true });
}

// DELETE ?product_id=... → remove
export async function DELETE(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const productId = url.searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json(
      { error: "product_id required" },
      { status: 400 },
    );
  }
  await removeFromWishlist(user.id, productId);
  return NextResponse.json({ ok: true });
}
