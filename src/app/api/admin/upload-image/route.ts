import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured — image upload requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file in 'file' field" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type ${file.type}. Use JPEG/PNG/WebP/AVIF.` },
      { status: 415 },
    );
  }

  const sb = supabaseServer();

  // Ensure bucket exists (public so getPublicUrl works without signing)
  const { data: buckets } = await sb.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createErr } = await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ALLOWED,
    });
    if (createErr) {
      return NextResponse.json(
        { error: `Could not create bucket: ${createErr.message}` },
        { status: 500 },
      );
    }
  }

  // Sanitize filename + namespace by date
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeBase = (file.name.split(".")[0] || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const datePath = new Date().toISOString().slice(0, 10);
  const path = `${datePath}/${Date.now()}-${safeBase}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}
