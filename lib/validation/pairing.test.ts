import { describe, expect, it } from "vitest";
import { pairingSchema } from "@/lib/validation/pairing";

describe("pairingSchema", () => {
  it("aceita título e categoria válidos (PAIR-01)", () => {
    const result = pairingSchema.safeParse({
      title: "Picanha na brasa",
      category: "carne",
      intensity: "intensa",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem título ou categoria", () => {
    expect(pairingSchema.safeParse({ category: "carne" }).success).toBe(false);
    expect(pairingSchema.safeParse({ title: "Risoto" }).success).toBe(false);
  });

  it("rejeita categoria inválida", () => {
    const result = pairingSchema.safeParse({ title: "Risoto", category: "invalida" });
    expect(result.success).toBe(false);
  });
});
