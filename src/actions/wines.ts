"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { emptyToNull, formDataToObject } from "@/lib/form";
import { quantitySchema, wineSchema } from "@/lib/validations/wine";
import type { ActionState } from "@/actions/auth";
import type { PairingCategory, Prisma, WineType } from "@prisma/client";

function normalizeWineInput(raw: Record<string, string>) {
  return {
    ...raw,
    vintage: raw.vintage === "" ? null : raw.vintage,
    alcoholPct: raw.alcoholPct === "" ? null : raw.alcoholPct,
    purchasePrice: raw.purchasePrice === "" ? null : raw.purchasePrice,
  };
}

export async function createWineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = wineSchema.safeParse(
    normalizeWineInput(formDataToObject(formData)),
  );

  if (!parsed.success) {
    return {
      error: "Verifique os campos do vinho.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const wine = await prisma.wine.create({
    data: {
      userId: user.id,
      name: data.name,
      producer: data.producer,
      type: data.type,
      grape: emptyToNull(data.grape),
      country: emptyToNull(data.country),
      region: emptyToNull(data.region),
      vintage: data.vintage ?? null,
      alcoholPct: data.alcoholPct ?? null,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice ?? null,
      location: emptyToNull(data.location),
      notes: emptyToNull(data.notes),
    },
  });

  revalidatePath("/vinhos");
  redirect(`/vinhos/${wine.id}`);
}

export async function updateWineAction(
  wineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await prisma.wine.findFirst({
    where: { id: wineId, userId: user.id },
  });
  if (!existing) {
    return { error: "Vinho não encontrado." };
  }

  const parsed = wineSchema.safeParse(
    normalizeWineInput(formDataToObject(formData)),
  );
  if (!parsed.success) {
    return {
      error: "Verifique os campos do vinho.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  await prisma.wine.update({
    where: { id: wineId },
    data: {
      name: data.name,
      producer: data.producer,
      type: data.type,
      grape: emptyToNull(data.grape),
      country: emptyToNull(data.country),
      region: emptyToNull(data.region),
      vintage: data.vintage ?? null,
      alcoholPct: data.alcoholPct ?? null,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice ?? null,
      location: emptyToNull(data.location),
      notes: emptyToNull(data.notes),
    },
  });

  revalidatePath("/vinhos");
  revalidatePath(`/vinhos/${wineId}`);
  redirect(`/vinhos/${wineId}`);
}

export async function deleteWineAction(wineId: string) {
  const user = await requireUser();
  const existing = await prisma.wine.findFirst({
    where: { id: wineId, userId: user.id },
  });
  if (!existing) {
    redirect("/vinhos");
  }

  await prisma.wine.delete({ where: { id: wineId } });
  revalidatePath("/vinhos");
  redirect("/vinhos");
}

export async function updateQuantityAction(
  wineId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const existing = await prisma.wine.findFirst({
    where: { id: wineId, userId: user.id },
  });
  if (!existing) {
    return { error: "Vinho não encontrado." };
  }

  const parsed = quantitySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      error: "Quantidade inválida.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.wine.update({
    where: { id: wineId },
    data: { quantity: parsed.data.quantity },
  });

  revalidatePath("/vinhos");
  revalidatePath(`/vinhos/${wineId}`);
  return {};
}

export type WineListParams = {
  q?: string;
  type?: string;
  inStock?: string;
  pairingCategory?: string;
  sort?: string;
};

export async function listWinesForUser(userId: string, params: WineListParams) {
  const where: Prisma.WineWhereInput = { userId };

  if (params.type && params.type !== "ALL") {
    where.type = params.type as WineType;
  }

  if (params.inStock === "1") {
    where.quantity = { gt: 0 };
  }

  if (params.pairingCategory && params.pairingCategory !== "ALL") {
    where.pairings = {
      some: { category: params.pairingCategory as PairingCategory },
    };
  }

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { producer: { contains: q, mode: "insensitive" } },
      { grape: { contains: q, mode: "insensitive" } },
      {
        pairings: {
          some: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  let orderBy: Prisma.WineOrderByWithRelationInput = { name: "asc" };
  if (params.sort === "vintage") orderBy = { vintage: "desc" };
  if (params.sort === "quantity") orderBy = { quantity: "desc" };

  return prisma.wine.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { pairings: true } },
    },
  });
}
