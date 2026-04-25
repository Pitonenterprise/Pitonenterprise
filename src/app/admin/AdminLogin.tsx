"use client";

import { useState } from "react";

export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) window.location.reload();
    else setError("Wrong password");
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-32">
      <h1 className="serif text-3xl mb-2">Admin login</h1>
      <p className="text-sm text-black/60 mb-6">
        Demo password: <code>admin123</code>
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          required
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg border border-black/15 focus:border-[var(--brand)] focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>
    </div>
  );
}
