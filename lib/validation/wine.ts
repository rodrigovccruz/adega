import { z } from "zod";

export const wineTypes = [
  "tinto",
  "branco",
  "rose",
  "espumante",
  "fortificado",
  "outro",
] as const;

export const wineTypeLabels: Record<(typeof wineTypes)[number], string> = {
  tinto: "Tinto",
  branco: "Branco",
  rose: "Rosé",
  espumante: "Espumante",
  fortificado: "Fortificado",
  outro: "Outro",
};

const optionalTrimmedString = z.string().trim().optional();

const optionalNumber = z.number().optional();

export const wineSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  producer: z.string().trim().min(1, "Produtor é obrigatório"),
  type: z.enum(wineTypes, { message: "Tipo inválido" }),
  grape: optionalTrimmedString,
  country: optionalTrimmedString,
  region: optionalTrimmedString,
  vintage: optionalNumber,
  alcoholPct: optionalNumber,
  quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa"),
  purchasePrice: optionalNumber,
  location: optionalTrimmedString,
  notes: optionalTrimmedString,
  labelPhotoUrl: optionalTrimmedString,
});

export type WineInput = z.infer<typeof wineSchema>;

export const wineUpdateSchema = wineSchema.partial();
export type WineUpdateInput = z.infer<typeof wineUpdateSchema>;

export const quantityAdjustSchema = z
  .object({
    delta: z.number().int().optional(),
    quantity: z.number().int().min(0, "Quantidade não pode ser negativa").optional(),
  })
  .refine((data) => data.delta !== undefined || data.quantity !== undefined, {
    message: "Informe delta ou quantity",
  });

export type QuantityAdjustInput = z.infer<typeof quantityAdjustSchema>;

export const wineListQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z.enum(wineTypes).optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  sort: z.enum(["name", "vintage", "quantity"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type WineListQuery = z.infer<typeof wineListQuerySchema>;
