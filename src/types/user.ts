export type InvestorExperience = "Beginner" | "Intermediate";
export type RiskTolerance = "Conservative" | "Moderate" | "Aggressive";
export type InvestmentHorizon = "3–5 years" | "5+ years";

export interface DemoUser {
  id: string;
  name: string;
  experience: InvestorExperience;
  riskTolerance: RiskTolerance;
  riskScore: number;
  investmentHorizon: InvestmentHorizon;
  goal: string;
  literacyScore: number;
}
