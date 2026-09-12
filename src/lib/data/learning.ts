import quizJson from "../../data/quiz.json" with { type: "json" };

import type { QuizQuestion } from "../../types/learning.ts";

const quizQuestions = quizJson as QuizQuestion[];

export function getQuizQuestions(): QuizQuestion[] {
  return quizQuestions;
}
