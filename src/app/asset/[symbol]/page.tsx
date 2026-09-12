import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssetDetailContent } from "@/components/analysis/asset-detail-content";
import { getAllAssets, getAsset, getUser } from "@/lib/data";

type AssetPageProps = { params: Promise<{ symbol: string }> };

export function generateStaticParams() {
  return getAllAssets().map((asset) => ({ symbol: asset.symbol.toLowerCase() }));
}

export async function generateMetadata({ params }: AssetPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const asset = getAsset(symbol);

  return {
    title: asset ? `${asset.symbol} investment health` : "Asset not found",
    description: asset
      ? `Understand ${asset.name} with transparent demo risk, fundamentals, and plain-English metrics.`
      : undefined,
  };
}

export default async function AssetDetailPage({ params }: AssetPageProps) {
  const { symbol } = await params;
  const asset = getAsset(symbol);
  const user = getUser("aarav");

  if (!asset || !user) {
    notFound();
  }

  return <AssetDetailContent asset={asset} user={user} />;
}
