import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validation/auth";

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "Ana@Example.com",
      password: "senha1234",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ana@example.com");
    }
  });

  it("rejeita senha com menos de 8 caracteres (AUTH-07)", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "not-an-email",
      password: "senha1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome vazio", () => {
    const result = registerSchema.safeParse({
      name: "  ",
      email: "ana@example.com",
      password: "senha1234",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("exige e-mail e senha", () => {
    expect(loginSchema.safeParse({ email: "ana@example.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "ana@example.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "invalido", password: "x" }).success).toBe(false);
  });
});
