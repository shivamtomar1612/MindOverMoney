import type { Lesson } from "../../types/lesson.ts";
import type { LearningCategory } from "../../types/learning.ts";

export function getLearningCategory(lesson: Lesson): LearningCategory {
  switch (lesson.category) {
    case "Risk":
      return "Risk";
    case "Valuation":
      return "Valuation";
    case "Financial Statements":
      return "Financial Statements";
    case "Market Cycles":
      return "Psychology";
    case "Profitability":
    case "Financial Health":
      return "Stocks";
    case "Company Basics":
    case "Portfolio Basics":
    default:
      return "Basics";
  }
}

export function getLessonDifficulty(lesson: Lesson): "Beginner" {
  void lesson;
  return "Beginner";
}

export function getLessonSlug(term: string): string {
  return term
    .toLocaleLowerCase("en-IN")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findLessonBySlug(lessons: Lesson[], slug: string): Lesson | undefined {
  return lessons.find((lesson) => getLessonSlug(lesson.term) === slug.toLocaleLowerCase("en-IN"));
}
