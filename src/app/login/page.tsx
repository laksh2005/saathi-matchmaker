"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) router.replace("/dashboard");
    else setError((await res.json()).error ?? "Could not sign in");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-rose-500 to-rose-700 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <p className="font-serif text-4xl leading-tight">Every great match starts with someone who listens.</p>
          <p className="mt-4 max-w-md text-rose-100">
            Saathi gives TDC matchmakers one calm place to know their clients, follow each journey and send thoughtful introductions.
          </p>
        </div>
        <p className="text-sm text-rose-100">The Date Crew, internal tools</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h1 className="font-serif text-2xl">Welcome back</h1>
            <p className="mt-1 text-sm text-sand-600">Sign in to your matchmaker workspace.</p>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Username</span>
            <input className="input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Password</span>
            <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          <p className="rounded-xl bg-sand-100 p-3 text-xs text-sand-600">
            Demo accounts: <b>ritika</b> or <b>arnav</b>, password <b>saathi123</b>
          </p>
        </form>
      </section>
    </main>
  );
}
