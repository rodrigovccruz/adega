import { describe, expect, it } from "vitest";
import { wineSchema } from "@/lib/validations/wine";

describe("wineSchema", () => {
  it("accepts a valid wine", () => {
    const result = wineSchema.safeParse({
      name: "Malbec Reserva",
      producer: "Bodega Sur",
      type: "TINTO",
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative quantity", () => {
    const result = wineSchema.safeParse({
      name: "Malbec Reserva",
      producer: "Bodega Sur",
      type: "TINTO",
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("requires name and producer", () => {
    const result = wineSchema.safeParse({
      name: "",
      producer: "",
      type: "TINTO",
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });
});
