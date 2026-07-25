import { z } from "zod";

export const wineTypeSchema = z.enum([
  "TINTO",
  "BRANCO",
  "ROSE",
  "ESPUMANTE",
  "FORTIFICADO",
  "OUTRO",
]);

export const wineSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  producer: z.string().trim().min(1, "Produtor é obrigatório").max(120),
  type: wineTypeSchema,
  grape: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  vintage: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  alcoholPct: z.coerce.number().min(0).max(100).optional().nullable(),
  quantity: z.coerce.number().int().min(0, "Quantidade não pode ser negativa"),
  purchasePrice: z.coerce.number().min(0).optional().nullable(),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const quantitySchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantidade não pode ser negativa"),
});

export type WineInput = z.infer<typeof wineSchema>;
