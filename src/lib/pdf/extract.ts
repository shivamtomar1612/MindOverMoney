import { PDFParse } from "pdf-parse";

export const MAX_REPORT_SIZE = 10 * 1024 * 1024;
export const REPORT_PARSE_ERROR = "We couldn't analyze this document. You can try the demo report instead.";

export function isPdfFile(file: Pick<File, "type" | "name">): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const parser = new PDFParse({ data: buffer, verbosity: 0 });
  try {
    const result = await parser.getText();
    const text = result.text.replace(/\u0000/g, " ").trim();
    if (!text) throw new Error("PDF contained no extractable text");
    return { text, pages: result.total };
  } finally {
    await parser.destroy();
  }
}
