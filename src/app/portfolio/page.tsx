import type { Metadata } from "next";

import { PaperPortfolio } from "@/components/portfolio/paper-portfolio";
import { getAllAssets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Paper Portfolio",
  description: "Practice portfolio allocation with deterministic demo money and no real trades.",
};

export default function PortfolioPage() {
  return <PaperPortfolio assets={getAllAssets()} />;
}
