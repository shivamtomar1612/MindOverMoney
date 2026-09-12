import type { Metadata } from "next";

import { ExploreContent } from "@/components/assets/explore-content";
import { getAllAssets } from "@/lib/data";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return <ExploreContent assets={getAllAssets()} />;
}
