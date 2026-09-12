import type { Metadata } from "next";

import { DecisionSimulator } from "@/components/simulator/decision-simulator";
import { getAllAssets } from "@/lib/data";

export const metadata: Metadata = {
  title: "Think Before You Invest",
  description: "A guided educational decision-readiness flow using offline demo market data.",
};

export default function SimulatorPage() {
  return <DecisionSimulator assets={getAllAssets()} />;
}
