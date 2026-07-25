import "server-only";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { PairingInput, PairingUpdateInput } from "@/lib/validation/pairing";

async function findOwnedWineOrThrow(userId: string, wineId: string) {
  const wine = await prisma.wine.findFirst({ where: { id: wineId, userId } });
  if (!wine) {
    throw new NotFoundError("Vinho não encontrado");
  }
  return wine;
}

async function findOwnedPairingOrThrow(userId: string, pairingId: string) {
  const pairing = await prisma.gastronomicSuggestion.findFirst({
    where: { id: pairingId, wine: { userId } },
  });
  if (!pairing) {
    throw new NotFoundError("Sugestão não encontrada");
  }
  return pairing;
}

export async function listPairings(userId: string, wineId: string) {
  await findOwnedWineOrThrow(userId, wineId);
  return prisma.gastronomicSuggestion.findMany({
    where: { wineId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPairing(userId: string, wineId: string, input: PairingInput) {
  await findOwnedWineOrThrow(userId, wineId);
  return prisma.gastronomicSuggestion.create({
    data: { ...input, wineId },
  });
}

export async function updatePairing(
  userId: string,
  pairingId: string,
  input: PairingUpdateInput,
) {
  await findOwnedPairingOrThrow(userId, pairingId);
  return prisma.gastronomicSuggestion.update({
    where: { id: pairingId },
    data: input,
  });
}

export async function deletePairing(userId: string, pairingId: string) {
  await findOwnedPairingOrThrow(userId, pairingId);
  await prisma.gastronomicSuggestion.delete({ where: { id: pairingId } });
}
