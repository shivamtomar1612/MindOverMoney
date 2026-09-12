import type { Metadata } from "next";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getAllAssets, getLessons, getUser } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const user = getUser("aarav");

  if (!user) {
    return null;
  }

  const snapshotSymbols = [
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "TATAMOTORS",
    "ICICIBANK",
  ];
  const allAssets = getAllAssets();
  const marketAssets = allAssets.filter((asset) =>
    snapshotSymbols.includes(asset.symbol),
  );

  return <DashboardContent user={user} marketAssets={marketAssets} allAssets={allAssets} lessonCount={getLessons().length} />;
}
