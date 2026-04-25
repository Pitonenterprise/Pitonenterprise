"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { AuthShell, authInput } from "@/components/AuthShell";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const justSignedUp = params.get("from") === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders and check out faster"
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-[var(--brand)] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {justSignedUp && (
        <div className="bg-green-50 border border-green-200 text-green-900 text-sm rounded-lg p-3 mb-4">
          ✓ Account created. Check your email for a confirmation link, then
          sign in.
        </div>
      )}
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
        <label className="block">
          <span className="text-xs text-black/60 block mb-1">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-xs text-black/55 pt-2">
          <Link href="/forgot-password" className="hover:underline">
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
