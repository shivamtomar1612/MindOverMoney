import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonDetail } from "@/components/learning/lesson-detail";
import { findLessonBySlug, getLessonSlug } from "@/lib/learning/categories";
import { getLessons } from "@/lib/data";

type LessonPageProps = { params: Promise<{ term: string }> };

export function generateStaticParams() {
  return getLessons().map((lesson) => ({ term: getLessonSlug(lesson.term) }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { term } = await params;
  const lesson = findLessonBySlug(getLessons(), term);
  return { title: lesson?.term ?? "Lesson not found", description: lesson?.simpleExplanation };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { term } = await params;
  const lessons = getLessons();
  const lesson = findLessonBySlug(lessons, term);
  if (!lesson) notFound();
  return <LessonDetail lesson={lesson} totalLessons={lessons.length} />;
}
