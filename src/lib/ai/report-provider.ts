import OpenAI from "openai";

import type { ReportAnalysis } from "../../types/report-analysis";
import { buildReportAnalysisPrompt, normalizeReportModelOutput, REPORT_ANALYZER_INSTRUCTIONS } from "./report-prompts";

export async function analyzeReportWithOpenAI(text: string): Promise<ReportAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI is not configured");
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
    instructions: REPORT_ANALYZER_INSTRUCTIONS,
    input: buildReportAnalysisPrompt(text),
    store: false,
  });
  const cleaned = response.output_text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return normalizeReportModelOutput(JSON.parse(cleaned));
}
