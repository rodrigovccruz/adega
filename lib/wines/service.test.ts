import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  listWines,
  getWine,
  createWine,
  updateWine,
  deleteWine,
  adjustWineQuantity,
} from "@/lib/wines/service";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { resetDb, createTestUser } from "../../test/db";
import { wineListQuerySchema } from "@/lib/validation/wine";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const defaultQuery = wineListQuerySchema.parse({});

describe("isolamento entre usuários", () => {
  it("usuário A não vê vinhos do usuário B", async () => {
    const userA = await createTestUser({ email: "a@example.com" });
    const userB = await createTestUser({ email: "b@example.com" });

    await createWine(userA.id, {
      name: "Vinho da A",
      producer: "Prod A",
      type: "tinto",
      quantity: 1,
    });

    const winesForB = await listWines(userB.id, defaultQuery);
    expect(winesForB).toHaveLength(0);
  });

  it("usuário B recebe 404 ao acessar vinho de A por id (sem vazar existência)", async () => {
    const userA = await createTestUser({ email: "a@example.com" });
    const userB = await createTestUser({ email: "b@example.com" });

    const wine = await createWine(userA.id, {
      name: "Vinho da A",
      producer: "Prod A",
      type: "tinto",
      quantity: 1,
    });

    await expect(getWine(userB.id, wine.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(updateWine(userB.id, wine.id, { name: "Hack" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(deleteWine(userB.id, wine.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("regras de negócio do inventário", () => {
  it("quantidade não pode ficar negativa (delta)", async () => {
    const user = await createTestUser();
    const wine = await createWine(user.id, {
      name: "Vinho",
      producer: "Prod",
      type: "tinto",
      quantity: 2,
    });

    await expect(adjustWineQuantity(user.id, wine.id, { delta: -5 })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("ajusta quantidade por delta e por valor absoluto", async () => {
    const user = await createTestUser();
    const wine = await createWine(user.id, {
      name: "Vinho",
      producer: "Prod",
      type: "tinto",
      quantity: 2,
    });

    const afterDelta = await adjustWineQuantity(user.id, wine.id, { delta: 3 });
    expect(afterDelta.quantity).toBe(5);

    const afterAbsolute = await adjustWineQuantity(user.id, wine.id, { quantity: 0 });
    expect(afterAbsolute.quantity).toBe(0);
  });

  it("exclusão remove o vinho e suas sugestões em cascata", async () => {
    const user = await createTestUser();
    const wine = await createWine(user.id, {
      name: "Vinho",
      producer: "Prod",
      type: "tinto",
      quantity: 1,
    });

    await prisma.gastronomicSuggestion.create({
      data: { wineId: wine.id, title: "Picanha", category: "carne" },
    });

    await deleteWine(user.id, wine.id);

    const remainingPairings = await prisma.gastronomicSuggestion.findMany({
      where: { wineId: wine.id },
    });
    expect(remainingPairings).toHaveLength(0);
  });
});

describe("busca e filtros", () => {
  it("busca por nome/uva/produtor encontra o termo (WINE-07)", async () => {
    const user = await createTestUser();
    await createWine(user.id, {
      name: "Malbec Reserva",
      producer: "Bodega X",
      type: "tinto",
      grape: "Malbec",
      quantity: 1,
    });
    await createWine(user.id, {
      name: "Chardonnay",
      producer: "Vinícola Y",
      type: "branco",
      quantity: 1,
    });

    const result = await listWines(user.id, { ...defaultQuery, q: "malbec" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Malbec Reserva");
  });

  it("busca por texto de sugestão gastronômica encontra o vinho (cenário feliz da spec 03)", async () => {
    const user = await createTestUser();
    const wine = await createWine(user.id, {
      name: "Malbec Reserva",
      producer: "Bodega X",
      type: "tinto",
      quantity: 1,
    });
    await prisma.gastronomicSuggestion.create({
      data: { wineId: wine.id, title: "Picanha na brasa", category: "carne" },
    });

    const result = await listWines(user.id, { ...defaultQuery, q: "picanha" });
    expect(result.map((w) => w.id)).toContain(wine.id);
  });

  it('busca por "queijo" encontra vinhos com sugestão contendo o termo OU categoria queijo (PAIR-05/06)', async () => {
    const user = await createTestUser();

    const winePorTermo = await createWine(user.id, {
      name: "Vinho A",
      producer: "Prod",
      type: "tinto",
      quantity: 1,
    });
    await prisma.gastronomicSuggestion.create({
      data: { wineId: winePorTermo.id, title: "Tábua de queijo", category: "outro" },
    });

    const winePorCategoria = await createWine(user.id, {
      name: "Vinho B",
      producer: "Prod",
      type: "branco",
      quantity: 1,
    });
    await prisma.gastronomicSuggestion.create({
      data: { wineId: winePorCategoria.id, title: "Brie", category: "queijo" },
    });

    const wineSemRelacao = await createWine(user.id, {
      name: "Vinho C",
      producer: "Prod",
      type: "rose",
      quantity: 1,
    });
    void wineSemRelacao;

    const result = await listWines(user.id, { ...defaultQuery, q: "queijo" });
    const ids = result.map((w) => w.id);
    expect(ids).toContain(winePorTermo.id);
    expect(ids).toContain(winePorCategoria.id);
    expect(ids).not.toContain(wineSemRelacao.id);
  });

  it('filtro "somente em estoque" oculta quantidade = 0', async () => {
    const user = await createTestUser();
    await createWine(user.id, {
      name: "Esgotado",
      producer: "Prod",
      type: "tinto",
      quantity: 0,
    });
    await createWine(user.id, {
      name: "Disponível",
      producer: "Prod",
      type: "tinto",
      quantity: 2,
    });

    const result = await listWines(user.id, { ...defaultQuery, inStock: true });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Disponível");
  });
});
