import type { Metadata } from "next";

import { QuizContent } from "@/components/learning/quiz-content";
import { getLessons, getQuizQuestions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Beginner Quiz",
  description: "Check your understanding of beginner financial concepts.",
};

export default function LearnQuizPage() {
  return <QuizContent questions={getQuizQuestions()} totalLessons={getLessons().length} />;
}
