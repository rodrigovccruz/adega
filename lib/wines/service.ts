import "server-only";
import { Prisma, SuggestionCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type {
  WineInput,
  WineUpdateInput,
  WineListQuery,
  QuantityAdjustInput,
} from "@/lib/validation/wine";

function matchingSuggestionCategory(term: string): SuggestionCategory | undefined {
  const normalized = term.trim().toLowerCase();
  return Object.values(SuggestionCategory).find((category) => category === normalized);
}

export async function listWines(userId: string, query: WineListQuery) {
  const where: Prisma.WineWhereInput = { userId };

  if (query.type) {
    where.type = query.type;
  }

  if (query.inStock) {
    where.quantity = { gt: 0 };
  }

  if (query.q) {
    const term = query.q;
    const matchedCategory = matchingSuggestionCategory(term);

    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { producer: { contains: term, mode: "insensitive" } },
      { grape: { contains: term, mode: "insensitive" } },
      {
        pairings: {
          some: {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
              ...(matchedCategory ? [{ category: matchedCategory }] : []),
            ],
          },
        },
      },
    ];
  }

  const orderBy: Prisma.WineOrderByWithRelationInput = {
    [query.sort]: query.order,
  };

  return prisma.wine.findMany({
    where,
    orderBy,
    include: { _count: { select: { pairings: true } } },
  });
}

async function findOwnedWineOrThrow(userId: string, wineId: string) {
  const wine = await prisma.wine.findFirst({
    where: { id: wineId, userId },
  });

  if (!wine) {
    throw new NotFoundError("Vinho não encontrado");
  }

  return wine;
}

export async function getWine(userId: string, wineId: string) {
  const wine = await prisma.wine.findFirst({
    where: { id: wineId, userId },
    include: { pairings: { orderBy: { createdAt: "desc" } } },
  });

  if (!wine) {
    throw new NotFoundError("Vinho não encontrado");
  }

  return wine;
}

export async function createWine(userId: string, input: WineInput) {
  return prisma.wine.create({
    data: { ...input, userId },
  });
}

export async function updateWine(userId: string, wineId: string, input: WineUpdateInput) {
  await findOwnedWineOrThrow(userId, wineId);

  return prisma.wine.update({
    where: { id: wineId },
    data: input,
  });
}

export async function deleteWine(userId: string, wineId: string) {
  await findOwnedWineOrThrow(userId, wineId);
  await prisma.wine.delete({ where: { id: wineId } });
}

export async function adjustWineQuantity(
  userId: string,
  wineId: string,
  input: QuantityAdjustInput,
) {
  const wine = await findOwnedWineOrThrow(userId, wineId);

  const nextQuantity =
    input.quantity !== undefined ? input.quantity : wine.quantity + (input.delta ?? 0);

  if (nextQuantity < 0) {
    throw new ValidationError("Quantidade não pode ficar negativa");
  }

  return prisma.wine.update({
    where: { id: wineId },
    data: { quantity: nextQuantity },
  });
}
