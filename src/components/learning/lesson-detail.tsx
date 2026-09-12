"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { StatusBadge } from "@/components/product/status-badge";
import { Button } from "@/components/ui/button";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { getLessonDifficulty, getLearningCategory } from "@/lib/learning/categories";
import type { Lesson } from "@/types";

export function LessonDetail({ lesson, totalLessons }: { lesson: Lesson; totalLessons: number }) {
  const { summary, completeLesson, isLessonComplete } = useLearningProgress(totalLessons);
  const [saved, setSaved] = useState(isLessonComplete(lesson.term));
  const category = getLearningCategory(lesson);
  function markUnderstood() { completeLesson(lesson.term); setSaved(true); }
  const chatContext = { type: "lesson" as const, title: lesson.term, description: lesson.simpleExplanation, data: { category, whyItMatters: lesson.whyItMatters, example: lesson.example, beginnerTakeaway: lesson.beginnerTakeaway }, userLevel: "Beginner" as const };

  return (
    <main className="page-container max-w-4xl">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Back to Learn</Link>
      <header className="mt-6 border-b border-border pb-7"><div className="flex flex-wrap items-center gap-2"><StatusBadge tone="accent">{category}</StatusBadge><StatusBadge>{getLessonDifficulty(lesson)} · 5 min</StatusBadge>{saved && <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><Check className="size-4" />Understood</span>}</div><h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">{lesson.term}</h1><p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{lesson.simpleExplanation}</p><div className="mt-5 flex flex-wrap gap-2"><Button onClick={markUnderstood} disabled={saved}>{saved ? <><Check aria-hidden="true" />I understand this</> : "I understand this"}</Button><ChatbotButton label="Ask AI about this" context={chatContext} /></div></header>

      <article className="mt-8 divide-y divide-border">
        <LessonSection label="Definition" body={lesson.simpleExplanation} />
        <LessonSection label="Simple explanation" body={lesson.simpleExplanation} />
        <LessonSection label="Example" body={lesson.example} />
        <LessonSection label="Why it matters" body={lesson.whyItMatters} />
        <LessonSection label="Common mistake" body={`Treating ${lesson.term} as a complete answer on its own. Use it alongside the wider business, risk, and valuation context.`} />
        <LessonSection label="Beginner takeaway" body={lesson.beginnerTakeaway} accent />
      </article>

      <section className="mt-9 border-y border-border bg-surface px-4 py-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-sm font-semibold">Quick check</h2><p className="mt-1 text-sm text-muted-foreground">Can you explain {lesson.term} in one sentence without using jargon?</p></div><ChatbotButton label="Practice with AI" context={chatContext} /></div></section>
      <footer className="mt-7 flex flex-col justify-between gap-4 text-sm sm:flex-row sm:items-center"><p className="text-muted-foreground">{summary.score}% · {summary.level} · {summary.completedLessons}/{summary.totalLessons} lessons understood</p><Button onClick={markUnderstood} disabled={saved} variant={saved ? "outline" : "default"}>{saved ? "Saved to your progress" : "I understand this"}</Button></footer>
    </main>
  );
}

function LessonSection({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) { return <section className="grid gap-3 py-6 sm:grid-cols-[180px_1fr]"><h2 className={`text-sm font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{label}</h2><p className="text-sm leading-7 text-muted-foreground">{body}</p></section>; }
