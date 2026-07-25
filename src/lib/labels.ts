import type { PairingCategory, PairingIntensity, WineType } from "@prisma/client";

export const WINE_TYPE_LABELS: Record<WineType, string> = {
  TINTO: "Tinto",
  BRANCO: "Branco",
  ROSE: "Rosé",
  ESPUMANTE: "Espumante",
  FORTIFICADO: "Fortificado",
  OUTRO: "Outro",
};

export const PAIRING_CATEGORY_LABELS: Record<PairingCategory, string> = {
  CARNE: "Carne",
  PEIXE: "Peixe",
  MASSA: "Massa",
  QUEIJO: "Queijo",
  SOBREMESA: "Sobremesa",
  VEGETARIANO: "Vegetariano",
  OCASIAO: "Ocasião",
  OUTRO: "Outro",
};

export const PAIRING_INTENSITY_LABELS: Record<PairingIntensity, string> = {
  LEVE: "Leve",
  MEDIA: "Média",
  INTENSA: "Intensa",
};

export const WINE_TYPES = Object.keys(WINE_TYPE_LABELS) as WineType[];
export const PAIRING_CATEGORIES = Object.keys(
  PAIRING_CATEGORY_LABELS,
) as PairingCategory[];
export const PAIRING_INTENSITIES = Object.keys(
  PAIRING_INTENSITY_LABELS,
) as PairingIntensity[];
