import assert from "node:assert/strict";

import { getLessons } from "../src/lib/data/demo-data.ts";
import { getQuizQuestions } from "../src/lib/data/learning.ts";
import { findLessonBySlug, getLessonSlug, getLearningCategory } from "../src/lib/learning/categories.ts";
import {
  createEmptyLearningProgress,
  getLearningLevel,
  getLearningSummary,
  getLiteracyScore,
  normalizeLearningProgress,
} from "../src/lib/learning/progress.ts";

const lessons = getLessons();
const quiz = getQuizQuestions();
assert.equal(lessons.length, 20, "the learning center should expose all 20 lessons");
assert.equal(quiz.length, 10, "the beginner quiz should contain 10 questions");
assert.ok(quiz.every((question) => question.options.length >= 3 && question.correctIndex >= 0 && question.correctIndex < question.options.length));

const categories = new Set(lessons.map(getLearningCategory));
assert.ok(categories.has("Basics"));
assert.ok(categories.has("Risk"));
assert.ok(categories.has("Valuation"));
assert.ok(categories.has("Financial Statements"));
assert.ok(categories.has("Stocks"));
assert.ok(categories.has("Psychology"));

const firstLesson = lessons[0];
assert.equal(findLessonBySlug(lessons, getLessonSlug(firstLesson.term))?.term, firstLesson.term);
assert.equal(getLiteracyScore(createEmptyLearningProgress(), lessons.length), 42);
assert.equal(getLearningSummary({ completedLessons: lessons.map((lesson) => lesson.term), bestQuizScore: 0 }, lessons.length).score, 72);
assert.equal(getLearningSummary({ completedLessons: [], bestQuizScore: 7 }, lessons.length).score, 63);
assert.equal(getLearningSummary({ completedLessons: lessons.map((lesson) => lesson.term), bestQuizScore: 7 }, lessons.length).score, 93);
assert.equal(getLearningLevel(42), "Beginner");
assert.equal(getLearningLevel(70), "Confident Learner");
assert.equal(getLearningLevel(85), "Financially Aware");

const normalized = normalizeLearningProgress({ completedLessons: ["P/E Ratio", "P/E Ratio", ""], bestQuizScore: 99, lastQuizScore: -2 });
assert.deepEqual(normalized.completedLessons, ["P/E Ratio"]);
assert.equal(normalized.bestQuizScore, 10);
assert.equal(normalized.lastQuizScore, 0);

console.log("Learning validation passed: lessons, categories, quiz, score updates, levels, and progress normalization.");
