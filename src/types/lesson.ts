export type LessonCategory =
  | "Valuation"
  | "Profitability"
  | "Financial Health"
  | "Company Basics"
  | "Risk"
  | "Portfolio Basics"
  | "Market Cycles"
  | "Financial Statements";

export interface Lesson {
  term: string;
  category: LessonCategory;
  simpleExplanation: string;
  whyItMatters: string;
  example: string;
  beginnerTakeaway: string;
}
