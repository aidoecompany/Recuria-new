"use client";

export const dynamic = "force-dynamic";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setError(loginError.message || "Unable to sign in. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then click Forgot password.");
      return;
    }

    setError("");
    setMessage("");
    setResetLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/login`
        : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo }
    );

    if (resetError) {
      setError(resetError.message || "Could not send reset email.");
      setResetLoading(false);
      return;
    }

    setMessage(
      "Password reset link sent. Check your inbox and follow the instructions."
    );
    setResetLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f7] px-4 py-12 text-[#1d1d1f]">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#dfe3ea]/70 blur-3xl" />

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/60 bg-white/75 p-8 shadow-[0_18px_45px_rgba(17,24,39,0.12)] backdrop-blur-xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
            Recuria
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-[#6e6e73]">
            Continue to your clinical assistant workspace.
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#3a3a3c]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@clinic.com"
                className="w-full rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8e8e93] focus:ring-2 focus:ring-[#8e8e93]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#3a3a3c]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-[#d2d2d7] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8e8e93] focus:ring-2 focus:ring-[#8e8e93]/20"
              />
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-sm font-medium text-[#0071e3] transition hover:text-[#0058b0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resetLoading ? "Sending reset link..." : "Forgot password?"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1d1d1f] px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
