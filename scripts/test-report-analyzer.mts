import assert from "node:assert/strict";

import { analyzeReportText, getDemoReportAnalysis } from "../src/lib/ai/report-fallback.ts";
import { extractPdfText, isPdfFile, MAX_REPORT_SIZE } from "../src/lib/pdf/extract.ts";
import { getDemoReport } from "../src/lib/data/demo-data.ts";

const demo = getDemoReportAnalysis(getDemoReport());
assert.equal(demo.overallHealth, 78);
assert.equal(demo.revenue.status, "Strong");
assert.equal(demo.profitability.status, "Strong");
assert.equal(demo.cashFlow.status, "Healthy");
assert.equal(demo.debt.status, "Moderate");
assert.equal(demo.margins.status, "Watch");
assert.match(demo.beginnerExplanation, /positive cash flow/i);

const uploaded = analyzeReportText(
  "Annual report. Revenue growth 12.0%. Profit growth 14.0%. Debt growth 20%. Operating cash flow growth 5%. Profit margin 9%. Debt-to-equity 0.9.",
);
assert.equal(uploaded.source, "uploaded");
assert.equal(uploaded.revenue.status, "Strong");
assert.equal(uploaded.debt.status, "Moderate");
assert.match(uploaded.margins.detail, /9%/);

const missing = analyzeReportText("A short document with no financial metrics.");
assert.equal(missing.overallHealth, 50);
assert.equal(missing.revenue.status, "Needs data");
assert.ok(missing.redFlags.length > 0);

assert.equal(isPdfFile({ type: "application/pdf", name: "report.bin" }), true);
assert.equal(isPdfFile({ type: "text/plain", name: "report.pdf" }), true);
assert.equal(isPdfFile({ type: "text/plain", name: "notes.txt" }), false);
assert.equal(MAX_REPORT_SIZE, 10 * 1024 * 1024);

function makePdf(text: string): Buffer {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length + 42} >>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(${text}) Tj\nET\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let document = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(document));
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(document);
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  document += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(document);
}

const extracted = await extractPdfText(makePdf("Revenue growth 14.8% and positive cash flow."));
assert.match(extracted.text, /Revenue growth 14\.8%/i);
assert.equal(extracted.pages, 1);

await assert.rejects(() => extractPdfText(Buffer.from("not a PDF")));
console.log("Report analyzer validation passed: demo, fallback, PDF extraction, invalid input, and size/type rules.");
