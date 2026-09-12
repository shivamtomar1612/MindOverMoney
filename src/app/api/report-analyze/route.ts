import { NextResponse } from "next/server";

import { analyzeReportWithOpenAI } from "@/lib/ai/report-provider";
import { analyzeReportText } from "@/lib/ai/report-fallback";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { text?: unknown };
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    if (!text) return NextResponse.json({ error: "No report text was provided." }, { status: 400 });

    if (process.env.OPENAI_API_KEY?.trim()) {
      try {
        return NextResponse.json(await analyzeReportWithOpenAI(text));
      } catch {
        // A demo should remain usable when a key is missing, expired, or unavailable.
      }
    }
    return NextResponse.json(analyzeReportText(text));
  } catch {
    return NextResponse.json(
      { error: "We couldn't analyze this document. You can try the demo report instead." },
      { status: 422 },
    );
  }
}
