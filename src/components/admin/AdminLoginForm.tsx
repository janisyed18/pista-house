"use client";

import { ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { PistaHouseLogo } from "@/components/brand/PistaHouseLogo";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@pistahouse.com.au");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid admin credentials");
      setLoading(false);
      return;
    }

    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded border border-black/8 bg-white p-6 shadow-lift">
      <div className="mb-5">
        <PistaHouseLogo showSuburb={false} tone="light" imageClassName="h-12 w-44" />
      </div>
      <div className="mb-6 flex items-center gap-3 border-t border-black/8 pt-5">
        <span className="grid h-11 w-11 place-items-center rounded bg-burgundy-900 text-white">
          <ShieldCheck aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron-700">Admin only</p>
          <h1 className="text-3xl font-black text-ink">Sign in</h1>
        </div>
      </div>

      {error ? <p className="mb-4 rounded bg-burgundy-500/10 px-3 py-2 text-sm font-bold text-burgundy-700">{error}</p> : null}

      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-black text-charcoal">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded border border-black/10 px-3 text-sm font-bold"
            type="email"
            autoComplete="username"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black text-charcoal">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded border border-black/10 px-3 text-sm font-bold"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded bg-burgundy-900 px-5 text-sm font-black text-white disabled:bg-charcoal/25"
      >
        {loading ? "Signing in..." : "Sign in securely"}
      </button>
    </form>
  );
}
