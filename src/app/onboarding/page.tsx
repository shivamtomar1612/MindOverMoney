import type { Metadata } from "next";

import { OnboardingFlow } from "@/components/profile/onboarding-flow";
import { getUser } from "@/lib/data";

export const metadata: Metadata = { title: "Set up your profile" };

export default function OnboardingPage() {
  const profile = getUser("aarav");
  if (!profile) return null;
  return <OnboardingFlow initialProfile={profile} />;
}
