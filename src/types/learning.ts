export const LEARNING_CATEGORIES = [
  "Basics",
  "Risk",
  "Valuation",
  "Financial Statements",
  "Stocks",
  "Psychology",
] as const;

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];

export type LearningLevel =
  | "Beginner"
  | "Learner"
  | "Confident Learner"
  | "Financially Aware";

export interface LearningProgressState {
  completedLessons: string[];
  bestQuizScore: number;
  lastQuizScore?: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningSummary {
  score: number;
  level: LearningLevel;
  completedLessons: number;
  totalLessons: number;
  bestQuizScore: number;
  progressToNextLevel: number;
  nextLevel: LearningLevel | null;
}
