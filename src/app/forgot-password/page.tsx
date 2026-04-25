"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { AuthShell, authInput } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const origin = window.location.origin;
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(
      email,
      { redirectTo: `${origin}/reset-password` },
    );
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    setSent(true);
    setSubmitting(false);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure link to set a new one"
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-[var(--brand)] hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="text-center space-y-3">
          <div className="text-3xl">📬</div>
          <p className="text-sm text-black/75">
            If <strong>{email}</strong> has an account, we&apos;ve sent a
            password-reset link. Check your inbox (and spam folder).
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs text-black/60 block mb-1">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInput}
            />
          </label>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
