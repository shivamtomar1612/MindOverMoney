import type {
  LearningLevel,
  LearningProgressState,
  LearningSummary,
} from "../../types/learning.ts";

export const DEFAULT_LITERACY_SCORE = 42;

const LEVELS: Array<{ name: LearningLevel; minimum: number; next: LearningLevel | null; nextMinimum: number }> = [
  { name: "Beginner", minimum: 0, next: "Learner", nextMinimum: 50 },
  { name: "Learner", minimum: 50, next: "Confident Learner", nextMinimum: 70 },
  { name: "Confident Learner", minimum: 70, next: "Financially Aware", nextMinimum: 85 },
  { name: "Financially Aware", minimum: 85, next: null, nextMinimum: 100 },
];

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

export function createEmptyLearningProgress(): LearningProgressState {
  return { completedLessons: [], bestQuizScore: 0 };
}

export function normalizeLearningProgress(value: unknown): LearningProgressState {
  if (!value || typeof value !== "object") return createEmptyLearningProgress();
  const candidate = value as Record<string, unknown>;
  const completedLessons = Array.isArray(candidate.completedLessons)
    ? [...new Set(candidate.completedLessons.filter((term): term is string => typeof term === "string" && term.trim().length > 0))]
    : [];
  const bestQuizScore = typeof candidate.bestQuizScore === "number" ? candidate.bestQuizScore : Number(candidate.bestQuizScore);
  const lastQuizScore = typeof candidate.lastQuizScore === "number" ? candidate.lastQuizScore : Number(candidate.lastQuizScore);
  return {
    completedLessons,
    bestQuizScore: Number.isFinite(bestQuizScore) ? clamp(Math.round(bestQuizScore), 0, 10) : 0,
    ...(Number.isFinite(lastQuizScore) ? { lastQuizScore: clamp(Math.round(lastQuizScore), 0, 10) } : {}),
  };
}

export function getLiteracyScore(progress: LearningProgressState, totalLessons: number, baseScore = DEFAULT_LITERACY_SCORE): number {
  const safeTotal = Math.max(0, totalLessons);
  const completed = safeTotal > 0 ? Math.min(safeTotal, progress.completedLessons.length) : 0;
  const lessonContribution = safeTotal > 0 ? (completed / safeTotal) * 30 : 0;
  const quizContribution = (clamp(progress.bestQuizScore, 0, 10) / 10) * 30;
  return Math.round(clamp(baseScore + lessonContribution + quizContribution, 0, 100));
}

export function getLearningLevel(score: number): LearningLevel {
  const boundedScore = clamp(score, 0, 100);
  return [...LEVELS].reverse().find((level) => boundedScore >= level.minimum)?.name ?? "Beginner";
}

export function getProgressToNextLevel(score: number): number {
  const boundedScore = clamp(score, 0, 100);
  const current = LEVELS.find((level) => boundedScore >= level.minimum && boundedScore < level.nextMinimum) ?? LEVELS[LEVELS.length - 1];
  if (!current.next) return 100;
  return Math.round(clamp(((boundedScore - current.minimum) / (current.nextMinimum - current.minimum)) * 100, 0, 100));
}

export function getNextLearningLevel(score: number): LearningLevel | null {
  const boundedScore = clamp(score, 0, 100);
  const current = [...LEVELS].reverse().find((level) => boundedScore >= level.minimum) ?? LEVELS[0];
  return current.next;
}

export function getLearningSummary(progress: LearningProgressState, totalLessons: number, baseScore = DEFAULT_LITERACY_SCORE): LearningSummary {
  const score = getLiteracyScore(progress, totalLessons, baseScore);
  return {
    score,
    level: getLearningLevel(score),
    completedLessons: Math.min(Math.max(0, totalLessons), progress.completedLessons.length),
    totalLessons: Math.max(0, totalLessons),
    bestQuizScore: progress.bestQuizScore,
    progressToNextLevel: getProgressToNextLevel(score),
    nextLevel: getNextLearningLevel(score),
  };
}
