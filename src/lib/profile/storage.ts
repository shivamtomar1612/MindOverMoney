import type { DemoUser } from "../../types/user";

export const DEMO_PROFILE_STORAGE_KEY = "mind-over-money:profile";
export const DEMO_PROFILE_EVENT = "mind-over-money:profile-change";

export function normalizeProfile(value: Partial<DemoUser>, fallback: DemoUser): DemoUser {
  const experience = value.experience === "Intermediate" ? "Intermediate" : "Beginner";
  const riskTolerance = value.riskTolerance === "Aggressive" ? "Aggressive" : value.riskTolerance === "Moderate" ? "Moderate" : "Conservative";
  const investmentHorizon = value.investmentHorizon === "5+ years" ? "5+ years" : "3–5 years";
  const riskScore = typeof value.riskScore === "number" && Number.isFinite(value.riskScore) ? Math.min(100, Math.max(0, Math.round(value.riskScore))) : fallback.riskScore;
  const literacyScore = typeof value.literacyScore === "number" && Number.isFinite(value.literacyScore) ? Math.min(100, Math.max(0, Math.round(value.literacyScore))) : fallback.literacyScore;
  return {
    id: typeof value.id === "string" && value.id ? value.id : fallback.id,
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : fallback.name,
    experience,
    riskTolerance,
    riskScore,
    investmentHorizon,
    goal: typeof value.goal === "string" && value.goal.trim() ? value.goal.trim() : fallback.goal,
    literacyScore,
  };
}

export function readDemoProfile(fallback: DemoUser): DemoUser {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    return raw ? normalizeProfile(JSON.parse(raw) as Partial<DemoUser>, fallback) : fallback;
  } catch {
    return fallback;
  }
}

export function writeDemoProfile(profile: DemoUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(DEMO_PROFILE_EVENT));
}
