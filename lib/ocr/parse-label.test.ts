import { describe, expect, it } from "vitest";
import { parseLabelFields, type OcrLine } from "@/lib/ocr/parse-label";

function line(text: string, height: number): OcrLine {
  return { text, height };
}

describe("parseLabelFields", () => {
  it("usa a linha de maior altura como nome e a próxima como produtor (OCR-03)", () => {
    const result = parseLabelFields([
      line("Malbec Reserva", 60),
      line("Bodega Serra Alta", 30),
      line("Mendoza, Argentina", 20),
    ]);

    expect(result.name).toBe("Malbec Reserva");
    expect(result.producer).toBe("Bodega Serra Alta");
  });

  it("reconhece a safra (ano de 4 dígitos) no texto", () => {
    const result = parseLabelFields([line("Malbec Reserva", 60), line("Safra 2020", 20)]);
    expect(result.vintage).toBe(2020);
  });

  it("ignora números fora da faixa plausível de safra", () => {
    const result = parseLabelFields([line("Lote 12345", 40)]);
    expect(result.vintage).toBeUndefined();
  });

  it("reconhece o tipo por palavra-chave, sem acento e case-insensitive", () => {
    expect(parseLabelFields([line("Vinho Tinto Seco", 40)]).type).toBe("tinto");
    expect(parseLabelFields([line("VINHO BRANCO", 40)]).type).toBe("branco");
    expect(parseLabelFields([line("Rosé Provence", 40)]).type).toBe("rose");
    expect(parseLabelFields([line("Champagne Brut", 40)]).type).toBe("espumante");
    expect(parseLabelFields([line("Porto Vintage", 40)]).type).toBe("fortificado");
  });

  it("retorna campos vazios para texto sem informação reconhecível (OCR-07)", () => {
    const result = parseLabelFields([line("##", 10), line("", 5)]);
    expect(result.vintage).toBeUndefined();
    expect(result.type).toBeUndefined();
  });

  it("não quebra com lista de linhas vazia (rótulo ilegível)", () => {
    const result = parseLabelFields([]);
    expect(result).toEqual({});
  });
});
