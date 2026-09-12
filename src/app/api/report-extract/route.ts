import { NextResponse } from "next/server";

import { extractPdfText, isPdfFile, MAX_REPORT_SIZE, REPORT_PARSE_ERROR } from "@/lib/pdf/extract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !isPdfFile(file)) {
      return NextResponse.json({ error: "Please upload a PDF file only." }, { status: 400 });
    }
    if (file.size > MAX_REPORT_SIZE) {
      return NextResponse.json({ error: "This PDF is larger than the 10 MB limit." }, { status: 413 });
    }

    const extracted = await extractPdfText(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ...extracted, filename: file.name });
  } catch {
    return NextResponse.json({ error: REPORT_PARSE_ERROR }, { status: 422 });
  }
}
