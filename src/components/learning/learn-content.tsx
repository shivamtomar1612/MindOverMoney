"use client";

import Link from "next/link";
import { ArrowRight, Check, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ChatbotButton } from "@/components/ai/ChatbotButton";
import { EmptyState } from "@/components/product/empty-state";
import { PageHeader, SectionHeader } from "@/components/product/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { getLessonDifficulty, getLessonSlug, getLearningCategory } from "@/lib/learning/categories";
import { cn } from "@/lib/utils";
import { LEARNING_CATEGORIES } from "@/types";
import type { LearningCategory, Lesson } from "@/types";

export function LearnContent({ lessons }: { lessons: Lesson[] }) {
  const [activeCategory, setActiveCategory] = useState<"All" | LearningCategory>("All");
  const [query, setQuery] = useState("");
  const { summary, isLessonComplete } = useLearningProgress(lessons.length);
  const filteredLessons = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en-IN");
    return lessons.filter((lesson) => {
      const category = getLearningCategory(lesson);
      return (activeCategory === "All" || category === activeCategory) && (!normalized || [lesson.term, lesson.simpleExplanation, category].some((value) => value.toLocaleLowerCase("en-IN").includes(normalized)));
    });
  }, [activeCategory, lessons, query]);

  return (
    <main className="page-container">
      <PageHeader eyebrow="Learning center" title="Learn investing" description="Build the knowledge to understand what you&apos;re looking at." action={<Link href="/learn/quiz" className={buttonVariants({ size: "sm" })}>Take the quiz<ArrowRight aria-hidden="true" /></Link>} />

      <section className="mt-7 grid gap-6 border-y border-border bg-surface px-4 py-5 sm:grid-cols-[1fr_220px]">
        <div><div className="flex items-end justify-between gap-4"><div><p className="text-xs text-muted-foreground">Financial Literacy Score</p><p className="mt-1 font-mono text-3xl font-semibold tabular-nums">{summary.score}%</p></div><p className="text-right text-xs text-muted-foreground">{summary.level}<br />{summary.nextLevel ? `${summary.progressToNextLevel}% toward ${summary.nextLevel}` : "Highest demo level"}</p></div><div className="mt-4 h-2 bg-surface-muted"><div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${summary.score}%` }} /></div></div>
        <div className="border-l-0 border-border sm:border-l sm:pl-6"><p className="text-xs text-muted-foreground">Lessons understood</p><p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{summary.completedLessons} / {summary.totalLessons}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Educational progress, not professional expertise.</p></div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Lesson library" description="Short, plain-English explanations of common financial concepts." />
        <div className="mt-5 flex flex-col gap-4 border-y border-border bg-surface py-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-1 overflow-x-auto" aria-label="Lesson categories"><Button variant={activeCategory === "All" ? "default" : "ghost"} size="sm" onClick={() => setActiveCategory("All")}>All</Button>{LEARNING_CATEGORIES.map((category) => <Button key={category} variant={activeCategory === category ? "default" : "ghost"} size="sm" onClick={() => setActiveCategory(category)}>{category}</Button>)}</div>
          <label className="relative block w-full lg:max-w-xs"><span className="sr-only">Search lessons</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/20" /></label>
        </div>

        {filteredLessons.length ? <div className="divide-y divide-border border-b border-border bg-surface">{filteredLessons.map((lesson) => { const category = getLearningCategory(lesson); const complete = isLessonComplete(lesson.term); return <article key={lesson.term} className="grid gap-4 px-3 py-4 hover:bg-surface-muted sm:grid-cols-[1fr_130px_100px_160px] sm:items-center"><Link href={`/learn/${getLessonSlug(lesson.term)}`} className="min-w-0"><span className="flex items-center gap-2"><span className="text-sm font-semibold">{lesson.term}</span>{complete && <Check className="size-4 text-success" aria-label="Understood" />}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{lesson.simpleExplanation}</span></Link><span className="text-xs text-muted-foreground">{category}</span><span className="text-xs text-muted-foreground">5 min · {getLessonDifficulty(lesson)}</span><div className="flex items-center gap-1 sm:justify-end"><ChatbotButton label="Ask AI" context={{ type: "lesson", title: lesson.term, description: lesson.simpleExplanation, data: { category, whyItMatters: lesson.whyItMatters, example: lesson.example, beginnerTakeaway: lesson.beginnerTakeaway }, userLevel: "Beginner" }} /><Link href={`/learn/${getLessonSlug(lesson.term)}`} aria-label={`Open ${lesson.term}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}><ArrowRight aria-hidden="true" /></Link></div></article>; })}</div> : <div className="mt-4"><EmptyState title="No lessons match this search" description="Try another term or choose All categories." actionLabel="Show all lessons" onAction={() => { setQuery(""); setActiveCategory("All"); }} /></div>}
      </section>
    </main>
  );
}
