import type { Metadata } from "next";

import { HypeCheckContent } from "@/components/hype/hype-check-content";
import { getAllAssets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hype Check",
  description: "Compare demo market attention with fundamentals before making an impulsive decision.",
};

export default function HypeCheckPage() {
  return <HypeCheckContent assets={getAllAssets()} />;
}
