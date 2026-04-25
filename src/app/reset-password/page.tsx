"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { AuthShell, authInput } from "@/components/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase fires a PASSWORD_RECOVERY event when the user lands here
  // via the link in the reset email. Until that fires, the user isn't
  // in a state that allows updateUser() to set the new password.
  useEffect(() => {
    const sb = supabaseBrowser();
    const { data: sub } = sb.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // If the page is opened directly (no recovery hash), still allow
    // the form — updateUser will fail with a clear error.
    setReady(true);
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <AuthShell
      title="Set a new password"
      footer={
        <Link href="/login" className="text-[var(--brand)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      {!ready ? (
        <p className="text-sm text-black/60">Loading…</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs text-black/60 block mb-1">
              New password (8+ characters)
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInput}
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/60 block mb-1">
              Confirm password
            </span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {submitting ? "Updating…" : "Set new password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
