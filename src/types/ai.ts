import type { Asset } from "./asset";

export interface ExplainRequest {
  term?: string;
  asset?: string | Partial<Asset> | null;
  question?: string;
}

export interface ExplainResponse {
  explanation: string;
  whyItMatters: string;
  assetContext: string;
  beginnerTakeaway: string;
}
