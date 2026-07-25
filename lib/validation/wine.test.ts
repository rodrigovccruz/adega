import { describe, expect, it } from "vitest";
import { wineSchema, quantityAdjustSchema } from "@/lib/validation/wine";

describe("wineSchema", () => {
  it("aceita vinho com apenas campos obrigatórios (WINE-01)", () => {
    const result = wineSchema.safeParse({
      name: "Malbec Reserva 2020",
      producer: "Adega Serra Alta",
      type: "tinto",
      quantity: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem nome/produtor/tipo/quantidade", () => {
    expect(wineSchema.safeParse({}).success).toBe(false);
    expect(
      wineSchema.safeParse({ producer: "X", type: "tinto", quantity: 1 }).success,
    ).toBe(false);
    expect(wineSchema.safeParse({ name: "X", type: "tinto", quantity: 1 }).success).toBe(
      false,
    );
    expect(
      wineSchema.safeParse({ name: "X", producer: "Y", quantity: 1 }).success,
    ).toBe(false);
  });

  it("rejeita quantidade negativa", () => {
    const result = wineSchema.safeParse({
      name: "X",
      producer: "Y",
      type: "tinto",
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const result = wineSchema.safeParse({
      name: "X",
      producer: "Y",
      type: "invalido",
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("quantityAdjustSchema", () => {
  it("aceita delta ou quantity", () => {
    expect(quantityAdjustSchema.safeParse({ delta: -1 }).success).toBe(true);
    expect(quantityAdjustSchema.safeParse({ quantity: 5 }).success).toBe(true);
  });

  it("rejeita quando nenhum dos dois é informado", () => {
    expect(quantityAdjustSchema.safeParse({}).success).toBe(false);
  });

  it("rejeita quantity negativa", () => {
    expect(quantityAdjustSchema.safeParse({ quantity: -1 }).success).toBe(false);
  });
});
