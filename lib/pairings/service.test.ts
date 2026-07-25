import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createWine } from "@/lib/wines/service";
import { createPairing, updatePairing, deletePairing, listPairings } from "@/lib/pairings/service";
import { NotFoundError } from "@/lib/errors";
import { resetDb, createTestUser } from "../../test/db";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("autorização de sugestões gastronômicas", () => {
  it("usuário não consegue criar sugestão em vinho de outro usuário (cenário de autorização da spec 03)", async () => {
    const userA = await createTestUser({ email: "a@example.com" });
    const userB = await createTestUser({ email: "b@example.com" });

    const wine = await createWine(userA.id, {
      name: "Vinho da A",
      producer: "Prod",
      type: "tinto",
      quantity: 1,
    });

    await expect(
      createPairing(userB.id, wine.id, { title: "Hack", category: "carne" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("usuário não consegue editar ou remover sugestão de vinho de outro usuário", async () => {
    const userA = await createTestUser({ email: "a@example.com" });
    const userB = await createTestUser({ email: "b@example.com" });

    const wine = await createWine(userA.id, {
      name: "Vinho da A",
      producer: "Prod",
      type: "tinto",
      quantity: 1,
    });
    const pairing = await createPairing(userA.id, wine.id, {
      title: "Picanha",
      category: "carne",
    });

    await expect(
      updatePairing(userB.id, pairing.id, { title: "Hack" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(deletePairing(userB.id, pairing.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("regras de negócio", () => {
  it("posso cadastrar 1+ sugestões em um vinho (PAIR-01)", async () => {
    const user = await createTestUser();
    const wine = await createWine(user.id, {
      name: "Vinho",
      producer: "Prod",
      type: "tinto",
      quantity: 1,
    });

    await createPairing(user.id, wine.id, { title: "Picanha", category: "carne" });
    await createPairing(user.id, wine.id, { title: "Costela", category: "carne" });

    const pairings = await listPairings(user.id, wine.id);
    expect(pairings).toHaveLength(2);
  });

  it("remover sugestão não remove o vinho (PAIR-03)", async () => {
    const user = await createTestUser();
    const wine = await createWine(user.id, {
      name: "Vinho",
      producer: "Prod",
      type: "tinto",
      quantity: 1,
    });
    const pairing = await createPairing(user.id, wine.id, {
      title: "Picanha",
      category: "carne",
    });

    await deletePairing(user.id, pairing.id);

    const stillThere = await prisma.wine.findUnique({ where: { id: wine.id } });
    expect(stillThere).not.toBeNull();
  });
});
