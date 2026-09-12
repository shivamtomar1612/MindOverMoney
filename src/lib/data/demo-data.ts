import assetsJson from "../../data/assets.json" with { type: "json" };
import demoReportJson from "../../data/demo-report.json" with { type: "json" };
import lessonsJson from "../../data/lessons.json" with { type: "json" };
import usersJson from "../../data/users.json" with { type: "json" };

import type {
  Asset,
  AssetDataset,
  DemoReport,
  DemoUser,
  Lesson,
} from "../../types/index.ts";

const assetDataset = assetsJson as AssetDataset;
const users = usersJson as DemoUser[];
const lessons = lessonsJson as Lesson[];
const demoReport = demoReportJson as DemoReport;

const normalize = (value: string) => value.trim().toLocaleLowerCase("en-IN");

export const DEMO_MARKET_DATA_NOTICE = assetDataset.disclaimer;

export function getAllAssets(): Asset[] {
  return assetDataset.assets;
}

export function getAsset(symbol: string): Asset | undefined {
  const normalizedSymbol = normalize(symbol);

  if (!normalizedSymbol) {
    return undefined;
  }

  return assetDataset.assets.find(
    (asset) => normalize(asset.symbol) === normalizedSymbol,
  );
}

export function searchAssets(query: string): Asset[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return getAllAssets();
  }

  return assetDataset.assets.filter((asset) =>
    [asset.symbol, asset.name, asset.sector].some((field) =>
      normalize(field).includes(normalizedQuery),
    ),
  );
}

export function getUser(id: string): DemoUser | undefined {
  const normalizedId = normalize(id);

  if (!normalizedId) {
    return undefined;
  }

  return users.find((user) => normalize(user.id) === normalizedId);
}

export function getLessons(): Lesson[] {
  return lessons;
}

export function getLesson(term: string): Lesson | undefined {
  const normalizedTerm = normalize(term);

  if (!normalizedTerm) {
    return undefined;
  }

  return lessons.find((lesson) => normalize(lesson.term) === normalizedTerm);
}

export function getDemoReport(): DemoReport {
  return demoReport;
}
