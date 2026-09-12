"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

export function QuizContent({ questions, totalLessons }: { questions: QuizQuestion[]; totalLessons: number }) {
  const { summary, recordQuiz } = useLearningProgress(totalLessons);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>(() => Array.from({ length: questions.length }, () => null));
  const [score, setScore] = useState<number | null>(null);
  const question = questions[currentIndex];

  function continueQuiz() { if (selectedIndex === null) return; const next = [...answers]; next[currentIndex] = selectedIndex; setAnswers(next); if (currentIndex === questions.length - 1) { const finalScore = next.reduce<number>((total, answer, index) => total + (answer === questions[index].correctIndex ? 1 : 0), 0); setScore(finalScore); recordQuiz(finalScore); return; } setCurrentIndex((index) => index + 1); setSelectedIndex(next[currentIndex + 1] ?? null); }
  function restart() { setCurrentIndex(0); setSelectedIndex(null); setAnswers(Array.from({ length: questions.length }, () => null)); setScore(null); }
  if (!question) return null;

  if (score !== null) return <main className="page-container max-w-3xl"><Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to Learn</Link><section className="mt-7 border-y border-border py-9"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Quiz complete</p><h1 className="mt-3 font-mono text-5xl font-semibold tabular-nums">{score} / {questions.length}</h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{score >= 8 ? "Strong foundation. Keep checking the evidence behind the numbers." : score >= 5 ? "You have a useful start. Revisit the lessons that felt unfamiliar." : "Take your time with the basics, then try the quiz again."}</p><div className="mt-8 max-w-md border border-border bg-surface p-5"><p className="text-xs text-muted-foreground">Updated Financial Literacy Score</p><p className="mt-1 font-mono text-3xl font-semibold tabular-nums">{summary.score}%</p><div className="mt-4 h-2 bg-surface-muted"><div className="h-full bg-primary" style={{ width: `${summary.score}%` }} /></div><p className="mt-3 text-xs text-muted-foreground">{summary.level}{summary.nextLevel ? ` · ${summary.progressToNextLevel}% toward ${summary.nextLevel}` : " · highest demo level reached"}</p></div><div className="mt-7 flex flex-wrap gap-3"><Button onClick={restart} variant="outline"><RotateCcw aria-hidden="true" />Try again</Button><Link href="/learn" className={buttonVariants()}>Explore lessons<ArrowRight aria-hidden="true" /></Link></div></section></main>;

  const progress = ((currentIndex + (selectedIndex !== null ? 1 : 0)) / questions.length) * 100;
  return <main className="page-container max-w-3xl"><Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to Learn</Link><header className="mt-6 border-b border-border pb-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Beginner check-in</p><h1 className="mt-2 text-3xl font-semibold">Financial literacy quiz</h1></div><span className="font-mono text-sm text-muted-foreground">{currentIndex + 1}/{questions.length}</span></div><div className="mt-5 h-1.5 bg-surface-muted"><div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${progress}%` }} /></div></header><section className="mt-8"><p className="text-xs text-muted-foreground">Question {currentIndex + 1}</p><h2 className="mt-2 text-2xl font-semibold leading-tight">{question.prompt}</h2><div className="mt-6 max-w-2xl divide-y divide-border border-y border-border">{question.options.map((option, index) => { const selected = selectedIndex === index; return <button key={option} type="button" onClick={() => setSelectedIndex(index)} aria-pressed={selected} className={cn("flex w-full items-center gap-3 px-3 py-4 text-left text-sm hover:bg-surface-muted", selected && "bg-accent")}><span className={cn("grid size-7 shrink-0 place-items-center rounded-md border font-mono text-xs", selected ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{selected ? <Check className="size-3" /> : String.fromCharCode(65 + index)}</span><span>{option}</span></button>; })}</div><div className="mt-7 flex items-center justify-between gap-4"><p className="text-xs text-muted-foreground">Choose the most accurate answer.</p><Button onClick={continueQuiz} disabled={selectedIndex === null}>{currentIndex === questions.length - 1 ? "See my score" : "Next question"}<ArrowRight aria-hidden="true" /></Button></div></section><p className="mt-8 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">This quiz measures familiarity with the demo lessons. It does not indicate professional investment expertise.</p></main>;
}
