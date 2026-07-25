"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { emptyToNull, formDataToObject } from "@/lib/form";
import { pairingSchema } from "@/lib/validations/pairing";
import type { ActionState } from "@/actions/auth";

async function assertOwnedWine(wineId: string, userId: string) {
  return prisma.wine.findFirst({
    where: { id: wineId, userId },
  });
}

export async function createPairingAction(
  wineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const wine = await assertOwnedWine(wineId, user.id);
  if (!wine) {
    return { error: "Vinho não encontrado." };
  }

  const raw = formDataToObject(formData);
  const parsed = pairingSchema.safeParse({
    ...raw,
    intensity: raw.intensity === "" ? null : raw.intensity,
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos da sugestão.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.gastronomicSuggestion.create({
    data: {
      wineId,
      title: parsed.data.title,
      category: parsed.data.category,
      description: emptyToNull(parsed.data.description),
      intensity: parsed.data.intensity ?? null,
    },
  });

  revalidatePath(`/vinhos/${wineId}`);
  revalidatePath("/vinhos");
  return { ok: true };
}

export async function updatePairingAction(
  pairingId: string,
  wineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const pairing = await prisma.gastronomicSuggestion.findFirst({
    where: { id: pairingId, wine: { userId: user.id, id: wineId } },
  });
  if (!pairing) {
    return { error: "Sugestão não encontrada." };
  }

  const raw = formDataToObject(formData);
  const parsed = pairingSchema.safeParse({
    ...raw,
    intensity: raw.intensity === "" ? null : raw.intensity,
  });

  if (!parsed.success) {
    return {
      error: "Verifique os campos da sugestão.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.gastronomicSuggestion.update({
    where: { id: pairingId },
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      description: emptyToNull(parsed.data.description),
      intensity: parsed.data.intensity ?? null,
    },
  });

  revalidatePath(`/vinhos/${wineId}`);
  revalidatePath("/vinhos");
  return {};
}

export async function deletePairingAction(pairingId: string, wineId: string) {
  const user = await requireUser();
  const pairing = await prisma.gastronomicSuggestion.findFirst({
    where: { id: pairingId, wine: { userId: user.id, id: wineId } },
  });
  if (!pairing) {
    return;
  }

  await prisma.gastronomicSuggestion.delete({ where: { id: pairingId } });
  revalidatePath(`/vinhos/${wineId}`);
  revalidatePath("/vinhos");
}
