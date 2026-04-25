"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { AuthShell, authInput } from "@/components/AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    setError(null);

    const sb = supabaseBrowser();
    const origin = window.location.origin;
    const { error, data } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback?next=/account`,
      },
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    // If email confirmation is OFF in Supabase settings, user is logged in
    // immediately and we send them to /account. Otherwise they need to
    // confirm via email — bounce to /login with a hint.
    if (data.session) {
      router.push("/account");
      router.refresh();
    } else {
      router.push("/login?from=signup");
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Faster checkout, order tracking, and a saved address"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--brand)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-xs text-black/60 block mb-1">Full name</span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={authInput}
          />
        </label>
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
          <span className="text-xs text-black/60 block mb-1">
            Password (8+ characters)
          </span>
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
          {submitting ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-[11px] text-black/45 pt-1">
          By creating an account you agree to receive order-related emails.
        </p>
      </form>
    </AuthShell>
  );
}
