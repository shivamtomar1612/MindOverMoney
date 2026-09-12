import type { Metadata } from "next";

import { LearnContent } from "@/components/learning/learn-content";
import { getLessons } from "@/lib/data";

export const metadata: Metadata = {
  title: "Learn",
  description: "Beginner-friendly financial education with contextual AI explanations.",
};

export default function LearnPage() {
  return <LearnContent lessons={getLessons()} />;
}
