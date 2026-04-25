"use client";

import { useRef, useState } from "react";

export function ImageUploader({
  value,
  onChange,
  label = "Product photo",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function pick() {
    inputRef.current?.click();
  }

  function clear() {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className="text-xs text-black/60 block mb-1">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      {value ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="w-32 h-40 rounded-lg object-cover border border-black/10 bg-[var(--muted)]"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={pick}
              className="text-xs px-3 py-1.5 rounded-full border border-black/15 hover:border-[var(--brand)]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={clear}
              className="text-xs px-3 py-1.5 rounded-full text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="w-full border-2 border-dashed border-black/15 hover:border-[var(--brand)] rounded-xl py-6 text-sm text-black/60 hover:text-[var(--brand)] transition flex flex-col items-center gap-1"
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              <span className="text-2xl">📸</span>
              <span>Click to upload a photo</span>
              <span className="text-[10px] text-black/40">
                JPEG / PNG / WebP / AVIF · max 8 MB
              </span>
            </>
          )}
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
