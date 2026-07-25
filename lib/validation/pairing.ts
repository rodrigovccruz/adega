import { z } from "zod";

export const suggestionCategories = [
  "carne",
  "peixe",
  "massa",
  "queijo",
  "sobremesa",
  "vegetariano",
  "ocasiao",
  "outro",
] as const;

export const suggestionCategoryLabels: Record<(typeof suggestionCategories)[number], string> = {
  carne: "Carne",
  peixe: "Peixe",
  massa: "Massa",
  queijo: "Queijo",
  sobremesa: "Sobremesa",
  vegetariano: "Vegetariano",
  ocasiao: "Ocasião",
  outro: "Outro",
};

export const suggestionIntensities = ["leve", "media", "intensa"] as const;

export const suggestionIntensityLabels: Record<(typeof suggestionIntensities)[number], string> = {
  leve: "Leve",
  media: "Média",
  intensa: "Intensa",
};

export const pairingSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  category: z.enum(suggestionCategories, { message: "Categoria inválida" }),
  description: z.string().trim().optional(),
  intensity: z.enum(suggestionIntensities).optional(),
});

export type PairingInput = z.infer<typeof pairingSchema>;

export const pairingUpdateSchema = pairingSchema.partial();
export type PairingUpdateInput = z.infer<typeof pairingUpdateSchema>;
