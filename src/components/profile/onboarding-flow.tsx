"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import type { DemoUser, InvestmentHorizon, InvestorExperience, RiskTolerance } from "@/types";

const goals = ["Long-term wealth creation", "Wealth creation", "Growth", "Build financial knowledge"];
const riskOptions: Array<{ value: RiskTolerance; score: number; description: string }> = [
  { value: "Conservative", score: 25, description: "You prefer stability and smaller fluctuations, even when that may limit upside." },
  { value: "Moderate", score: 50, description: "You can accept some uncertainty when the reasoning and time horizon are clear." },
  { value: "Aggressive", score: 80, description: "You are more comfortable with large fluctuations and higher uncertainty." },
];
const steps = ["Experience", "Goal", "Time horizon", "Risk comfort", "Your result"];

export function OnboardingFlow({ initialProfile }: { initialProfile: DemoUser }) {
  const router = useRouter();
  const { save, saving } = useProfile(initialProfile);
  const [step, setStep] = useState(1);
  const [experience, setExperience] = useState<InvestorExperience>(initialProfile.experience);
  const [goal, setGoal] = useState(initialProfile.goal);
  const [horizon, setHorizon] = useState<InvestmentHorizon>(initialProfile.investmentHorizon);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(initialProfile.riskTolerance);
  const selectedRisk = riskOptions.find((item) => item.value === riskTolerance) ?? riskOptions[0];

  async function finish() {
    await save({ ...initialProfile, experience, goal, investmentHorizon: horizon, riskTolerance, riskScore: selectedRisk.score });
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
      <header className="border-b border-border pb-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Set up your learning profile</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">A few questions to frame the experience</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Your answers shape educational comparisons. They do not create personalized financial advice.</p></header>
      <ol className="mt-6 grid grid-cols-5 border-b border-border" aria-label="Onboarding progress">{steps.map((label, index) => { const item = index + 1; return <li key={label} className={`border-b-2 px-1 py-3 text-xs ${item === step ? "border-primary text-foreground" : item < step ? "border-primary/30 text-foreground" : "border-transparent text-muted-foreground"}`}><span className="font-mono">0{item}</span><span className="ml-2 hidden sm:inline">{label}</span></li>; })}</ol>

      <section className="min-h-[340px] py-9">
        {step === 1 && <ChoiceStep title="Your experience" description="How familiar are you with investing concepts today?" options={[{ value: "Beginner" as InvestorExperience, label: "Beginner", description: "Most ratios, statements, and market terms are still new." }, { value: "Intermediate" as InvestorExperience, label: "Intermediate", description: "You understand common concepts and want more structured analysis." }]} value={experience} onChange={setExperience} />}
        {step === 2 && <ChoiceStep title="Your goal" description="What would you most like to build toward?" options={goals.map((value) => ({ value, label: value }))} value={goal} onChange={setGoal} />}
        {step === 3 && <ChoiceStep title="Your time horizon" description="How long do you expect to keep working toward this goal?" options={[{ value: "3–5 years" as InvestmentHorizon, label: "3–5 years", description: "A medium-term planning horizon." }, { value: "5+ years" as InvestmentHorizon, label: "5+ years", description: "A longer period that may allow more time to learn and adjust." }]} value={horizon} onChange={setHorizon} />}
        {step === 4 && <ChoiceStep title="Your risk comfort" description="Which description is closest to how you feel about uncertainty?" options={riskOptions.map((item) => ({ value: item.value, label: item.value, description: item.description }))} value={riskTolerance} onChange={setRiskTolerance} />}
        {step === 5 && <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your learning profile</p><h2 className="mt-2 text-2xl font-semibold">{riskTolerance} · {horizon} · {experience}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">You selected a {riskTolerance.toLowerCase()} comfort level and a {horizon.toLowerCase()} horizon. The app will compare calculated asset risk with that comfort level and explain any gap. Your beginner/intermediate setting changes the language used in learning contexts—not the underlying data.</p><dl className="mt-7 max-w-xl divide-y divide-border border-y border-border"><ResultRow label="Goal" value={goal} /><ResultRow label="Risk comfort" value={`${riskTolerance} · ${selectedRisk.score}/100`} /><ResultRow label="Time horizon" value={horizon} /><ResultRow label="Experience" value={experience} /></dl></div>}
      </section>

      <div className="flex justify-between gap-3 border-t border-border pt-5"><Button variant="outline" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}><ArrowLeft aria-hidden="true" />Back</Button>{step < 5 ? <Button onClick={() => setStep((current) => Math.min(5, current + 1))}>Continue<ArrowRight aria-hidden="true" /></Button> : <Button onClick={() => void finish()} disabled={saving}>{saving ? "Saving…" : "Use this profile"}<Check aria-hidden="true" /></Button>}</div>
    </main>
  );
}

function ChoiceStep<T extends string>({ title, description, options, value, onChange }: { title: string; description: string; options: Array<{ value: T; label: string; description?: string }>; value: T; onChange: (value: T) => void }) { return <div><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p><div className="mt-6 max-w-2xl divide-y divide-border border-y border-border">{options.map((option) => { const selected = option.value === value; return <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`flex w-full items-start justify-between gap-4 px-3 py-4 text-left hover:bg-surface-muted ${selected ? "bg-accent" : ""}`}><span><span className="block text-sm font-semibold">{option.label}</span>{option.description && <span className="mt-1 block text-sm leading-6 text-muted-foreground">{option.description}</span>}</span><span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{selected && <Check className="size-3" />}</span></button>; })}</div></div>; }
function ResultRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-5 py-3"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-right text-sm font-semibold">{value}</dd></div>; }
