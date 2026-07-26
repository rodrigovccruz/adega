import { afterAll, describe, expect, it, vi } from "vitest";
import { scanWineLabel } from "@/lib/wines/label-scan-service";

const fakeImage = Buffer.from("fake-image-bytes");

afterAll(async () => {
  // limpa uploads locais gerados por este teste (storage local de dev)
  const { rm } = await import("node:fs/promises");
  const path = await import("node:path");
  await rm(path.join(process.cwd(), "public", "uploads", "labels"), {
    recursive: true,
    force: true,
  });
});

describe("scanWineLabel", () => {
  it("retorna a foto salva e os campos sugeridos quando o OCR funciona", async () => {
    const ocr = vi.fn().mockResolvedValue([{ text: "Malbec Reserva 2020", height: 50 }]);

    const result = await scanWineLabel(fakeImage, "image/jpeg", ocr);

    expect(result.labelPhotoUrl).toMatch(/\.jpg$/);
    expect(result.suggested.name).toBe("Malbec Reserva 2020");
    expect(result.suggested.vintage).toBe(2020);
  });

  it("retorna a foto salva mesmo quando o OCR falha (OCR-N2)", async () => {
    const ocr = vi.fn().mockRejectedValue(new Error("tesseract explodiu"));

    const result = await scanWineLabel(fakeImage, "image/png", ocr);

    expect(result.labelPhotoUrl).toMatch(/\.png$/);
    expect(result.suggested).toEqual({});
  });
});
