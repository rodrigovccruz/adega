import "server-only";
import { createWorker } from "tesseract.js";
import type { OcrLine } from "@/lib/ocr/parse-label";

/** Roda o OCR (Tesseract) sobre a imagem e retorna as linhas de texto com sua altura de bounding box. */
export async function recognizeLabelLines(buffer: Buffer): Promise<OcrLine[]> {
  const worker = await createWorker("eng+por");

  try {
    const { data } = await worker.recognize(buffer, {}, { blocks: true });

    const lines: OcrLine[] =
      data.blocks?.flatMap((block) =>
        block.paragraphs.flatMap((paragraph) =>
          paragraph.lines.map((line) => ({
            text: line.text,
            height: line.bbox.y1 - line.bbox.y0,
          })),
        ),
      ) ?? [];

    return lines;
  } finally {
    await worker.terminate();
  }
}
