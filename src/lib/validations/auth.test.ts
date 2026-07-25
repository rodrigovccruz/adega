import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("auth schemas", () => {
  it("requires password with at least 8 chars on register", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "curta",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid register payload", () => {
    const result = registerSchema.safeParse({
      name: "Ana Silva",
      email: "ana@example.com",
      password: "senhaforte",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({
      email: "nao-email",
      password: "qualquer",
    });
    expect(result.success).toBe(false);
  });
});
