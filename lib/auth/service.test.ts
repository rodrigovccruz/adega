import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { registerUser, authenticateUser } from "@/lib/auth/service";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import { resetDb } from "../../test/db";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("registerUser", () => {
  it("cria conta com dados válidos e nunca retorna a senha (AUTH-01)", async () => {
    const user = await registerUser({
      name: "Ana",
      email: "ana@example.com",
      password: "senha1234",
    });

    expect(user.email).toBe("ana@example.com");
    expect(user).not.toHaveProperty("passwordHash");
    expect(user).not.toHaveProperty("password");
  });

  it("armazena a senha com hash, nunca em texto puro (AUTH-N1)", async () => {
    await registerUser({ name: "Ana", email: "ana@example.com", password: "senha1234" });
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: "ana@example.com" } });
    expect(stored.passwordHash).not.toBe("senha1234");
    expect(stored.passwordHash.length).toBeGreaterThan(20);
  });

  it("rejeita e-mail já cadastrado (AUTH-06)", async () => {
    await registerUser({ name: "Ana", email: "ana@example.com", password: "senha1234" });

    await expect(
      registerUser({ name: "Outra Ana", email: "ana@example.com", password: "outrasenha" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("authenticateUser", () => {
  beforeEach(async () => {
    await registerUser({ name: "Ana", email: "ana@example.com", password: "senha1234" });
  });

  it("autentica com credenciais corretas", async () => {
    const user = await authenticateUser({ email: "ana@example.com", password: "senha1234" });
    expect(user.email).toBe("ana@example.com");
  });

  it("rejeita senha incorreta com erro genérico (AUTH-N2)", async () => {
    await expect(
      authenticateUser({ email: "ana@example.com", password: "errada" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejeita e-mail inexistente com a mesma mensagem genérica (AUTH-N2)", async () => {
    let messageForWrongPassword = "";
    let messageForUnknownEmail = "";

    try {
      await authenticateUser({ email: "ana@example.com", password: "errada" });
    } catch (error) {
      messageForWrongPassword = (error as Error).message;
    }

    try {
      await authenticateUser({ email: "ninguem@example.com", password: "errada" });
    } catch (error) {
      messageForUnknownEmail = (error as Error).message;
    }

    expect(messageForUnknownEmail).toBe(messageForWrongPassword);
  });
});
