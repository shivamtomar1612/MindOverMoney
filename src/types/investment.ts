export type RiskLevel = "low" | "moderate" | "high";

export type EducationalInsight = {
  title: string;
  plainEnglishSummary: string;
  riskLevel: RiskLevel;
  sources: string[];
};
