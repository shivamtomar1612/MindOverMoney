"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Wordmark } from "@/components/layout/site-header";
import { AuthStatusLabel } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setMessage(null); setSubmitting(true);
    const result = isSignup ? await signUp(email, password, name) : await signIn(email, password);
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    if (result.message) setMessage(result.message);
    if (!isSignup || result.message?.startsWith("Demo account")) router.push(isSignup ? "/onboarding" : "/dashboard");
  }

  const inputClass = "mt-2 h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/20";
  return (
    <main className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-[1fr_420px] sm:px-8">
      <section className="hidden md:block"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">A calmer way to learn investing</p><h2 className="mt-4 max-w-lg text-4xl font-semibold tracking-[-0.03em]">Understand the evidence behind a decision.</h2><p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Save your learning progress, risk profile, watchlist, and simulated portfolio. No brokerage account or real-money trading.</p><dl className="mt-8 max-w-md divide-y divide-border border-y border-border">{["Plain-English financial education", "Transparent risk calculations", "Demo data that works offline"].map((item, index) => <div key={item} className="flex gap-4 py-3"><dt className="font-mono text-xs text-primary">0{index + 1}</dt><dd className="text-sm font-medium">{item}</dd></div>)}</dl></section>
      <section className="border border-border bg-surface p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><Wordmark /><AuthStatusLabel /></div><h1 className="mt-8 text-2xl font-semibold">{isSignup ? "Create your learning profile" : "Welcome back"}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{isSignup ? "Save progress across sessions when Supabase is configured." : "Continue with your saved learning and decision profile."}</p><form onSubmit={submit} className="mt-6 space-y-4">{isSignup && <label className="block text-sm font-medium">Name<input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} autoComplete="name" /></label>}<label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} autoComplete="email" /></label><label className="block text-sm font-medium">Password<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} autoComplete={isSignup ? "new-password" : "current-password"} /><span className="mt-1.5 block text-xs text-muted-foreground">At least 6 characters.</span></label>{error && <p role="alert" className="border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</p>}{message && <p role="status" className="border border-success/20 bg-success/5 p-3 text-sm text-success">{message}</p>}<Button type="submit" disabled={submitting} className="w-full">{submitting ? "Working…" : isSignup ? "Create account" : "Log in"}<ArrowRight aria-hidden="true" /></Button></form><p className="mt-6 text-center text-sm text-muted-foreground">{isSignup ? "Already have an account?" : "New to Mind Over Money?"} <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-primary hover:underline">{isSignup ? "Log in" : "Create an account"}</Link></p><p className="mt-5 border-t border-border pt-4 text-center text-xs leading-5 text-muted-foreground">Without Supabase variables, authentication continues in local Demo Mode.</p></section>
    </main>
  );
}
