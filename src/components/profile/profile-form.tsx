"use client";

import { Check, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/product/page-header";
import { AuthStatusLabel } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import type { DemoUser } from "@/types";

const controlClass = "mt-2 h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/20";

export function ProfileForm({ initialProfile }: { initialProfile: DemoUser }) {
  const { profile, loading, saving, error, save, isDemo } = useProfile(initialProfile);
  const { user, signOut } = useAuth();
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const syncDraft = () => setDraft(profile);
    syncDraft();
  }, [profile]);
  const update = <K extends keyof DemoUser>(key: K, value: DemoUser[K]) => setDraft((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); await save(draft); setSaved(true); window.setTimeout(() => setSaved(false), 2400); }

  if (loading) return <main className="page-container max-w-4xl"><div className="h-8 w-52 animate-pulse bg-surface-muted" /><div className="mt-8 h-80 animate-pulse border border-border bg-surface-muted" /></main>;

  return (
    <main className="page-container max-w-4xl">
      <PageHeader eyebrow="Settings" title="Your decision profile" description="Keep your goals and comfort with uncertainty visible while you learn." action={user ? <Button variant="outline" size="sm" onClick={() => void signOut()}>Log out</Button> : undefined} />
      <div className="mt-5 flex items-center justify-between gap-4 border-y border-border bg-surface px-4 py-3 text-sm"><span>{isDemo ? "Demo Mode — changes stay on this device." : "Supabase account — changes sync privately."}</span><AuthStatusLabel /></div>

      <form onSubmit={submit} className="mt-9">
        <section><h2 className="text-lg font-semibold">Personal details</h2><p className="mt-1 text-sm text-muted-foreground">Used to frame educational explanations, not to provide financial advice.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Name"><input value={draft.name} onChange={(event) => update("name", event.target.value)} className={controlClass} /></Field><Field label="Experience"><select value={draft.experience} onChange={(event) => update("experience", event.target.value as DemoUser["experience"])} className={controlClass}><option>Beginner</option><option>Intermediate</option></select></Field><Field label="Goal" className="sm:col-span-2"><input value={draft.goal} onChange={(event) => update("goal", event.target.value)} className={controlClass} /></Field></div></section>
        <section className="mt-10 border-t border-border pt-8"><h2 className="text-lg font-semibold">Risk and time horizon</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Risk tolerance"><select value={draft.riskTolerance} onChange={(event) => update("riskTolerance", event.target.value as DemoUser["riskTolerance"])} className={controlClass}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></select></Field><Field label="Investment horizon"><select value={draft.investmentHorizon} onChange={(event) => update("investmentHorizon", event.target.value as DemoUser["investmentHorizon"])} className={controlClass}><option>3–5 years</option><option>5+ years</option></select></Field><Field label="Risk score" help="A 0–100 comfort scale used by compatibility tools."><input type="number" min="0" max="100" value={draft.riskScore} onChange={(event) => update("riskScore", Number(event.target.value))} className={controlClass} /></Field><Field label="Literacy score" help="Learning activity only; not professional expertise."><input type="number" min="0" max="100" value={draft.literacyScore} onChange={(event) => update("literacyScore", Number(event.target.value))} className={controlClass} /></Field></div></section>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center"><p className="text-sm text-muted-foreground">{user?.email ? `Signed in as ${user.email}` : "Using the Aarav demo profile."}</p><div className="flex items-center gap-3">{error && <p className="max-w-xs text-sm text-warning">{error}</p>}{saved && <span className="inline-flex items-center gap-1 text-sm text-success"><Check className="size-4" aria-hidden="true" />Saved</span>}<Button type="submit" disabled={saving}><Save aria-hidden="true" />{saving ? "Saving…" : "Save profile"}</Button></div></div>
      </form>
    </main>
  );
}

function Field({ label, help, className, children }: { label: string; help?: string; className?: string; children: React.ReactNode }) { return <label className={`block text-sm font-medium ${className ?? ""}`}>{label}{children}{help && <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">{help}</span>}</label>; }
