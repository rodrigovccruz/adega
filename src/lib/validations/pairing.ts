import { z } from "zod";

export const pairingCategorySchema = z.enum([
  "CARNE",
  "PEIXE",
  "MASSA",
  "QUEIJO",
  "SOBREMESA",
  "VEGETARIANO",
  "OCASIAO",
  "OUTRO",
]);

export const pairingIntensitySchema = z.enum(["LEVE", "MEDIA", "INTENSA"]);

export const pairingSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(120),
  category: pairingCategorySchema,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  intensity: pairingIntensitySchema.optional().nullable(),
});

export type PairingInput = z.infer<typeof pairingSchema>;
