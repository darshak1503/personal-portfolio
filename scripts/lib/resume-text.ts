import fs from "fs";
import path from "path";
import crypto from "crypto";
import mammoth from "mammoth";

// pdf-parse is CommonJS; dynamic import for ESM-friendly usage in tsx
export async function extractResumeText(
  filePath: string,
): Promise<{ text: string; hash: string }> {
  const buffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const ext = path.extname(filePath).toLowerCase();

  let text = "";
  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = result.text;
    await parser.destroy();
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new Error(`Unsupported resume format: ${ext}. Use .pdf or .docx`);
  }

  return { text: normalizeText(text), hash };
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}