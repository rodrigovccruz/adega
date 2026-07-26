import "server-only";
import { saveLabelPhoto } from "@/lib/storage/label-photo";
import { recognizeLabelLines } from "@/lib/ocr/tesseract-client";
import { parseLabelFields, type LabelSuggestion } from "@/lib/ocr/parse-label";

export type LabelScanResult = {
  labelPhotoUrl: string;
  suggested: LabelSuggestion;
};

const OCR_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`OCR excedeu ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Faz upload da foto do rótulo e tenta extrair campos via OCR.
 * Falha ou demora do OCR nunca impede o retorno da foto salva (OCR-N1,
 * OCR-N2): a extração é apenas um atalho de preenchimento, best-effort, e
 * corre contra um timeout para não travar a requisição indefinidamente
 * (risco documentado em specs/04-foto-rotulo-ocr.md).
 */
export async function scanWineLabel(
  buffer: Buffer,
  contentType: string,
  ocr: (buffer: Buffer) => Promise<Parameters<typeof parseLabelFields>[0]> = recognizeLabelLines,
): Promise<LabelScanResult> {
  const labelPhotoUrl = await saveLabelPhoto(buffer, contentType);

  try {
    const lines = await withTimeout(ocr(buffer), OCR_TIMEOUT_MS);
    return { labelPhotoUrl, suggested: parseLabelFields(lines) };
  } catch (error) {
    console.error("Falha ao processar OCR do rótulo:", error);
    return { labelPhotoUrl, suggested: {} };
  }
}
