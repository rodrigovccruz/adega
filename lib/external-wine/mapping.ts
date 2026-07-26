import type { wineTypes } from "@/lib/validation/wine";

type WineType = (typeof wineTypes)[number];

const COLOR_TO_TYPE: Record<string, WineType> = {
  red: "tinto",
  white: "branco",
  rose: "rose",
  sparkling: "espumante",
  fortified: "fortificado",
};

export function mapColorToType(color: string | null | undefined): WineType {
  if (!color) return "outro";
  return COLOR_TO_TYPE[color] ?? "outro";
}

const COUNTRY_ISO_TO_PT_BR: Record<string, string> = {
  fr: "França",
  de: "Alemanha",
  it: "Itália",
  es: "Espanha",
  pt: "Portugal",
  us: "Estados Unidos",
  ar: "Argentina",
  cl: "Chile",
  br: "Brasil",
  au: "Austrália",
  nz: "Nova Zelândia",
  za: "África do Sul",
  at: "Áustria",
  ch: "Suíça",
  gb: "Reino Unido",
  gr: "Grécia",
  hu: "Hungria",
  ro: "Romênia",
  ge: "Geórgia",
  uy: "Uruguai",
  cn: "China",
  jp: "Japão",
  ca: "Canadá",
  hr: "Croácia",
  si: "Eslovênia",
  bg: "Bulgária",
  md: "Moldávia",
};

export function mapCountryCode(code: string | null | undefined): string | undefined {
  if (!code) return undefined;
  const normalized = code.toLowerCase();
  return COUNTRY_ISO_TO_PT_BR[normalized] ?? code.toUpperCase();
}

export type GrapeMindsProducer = {
  id: number;
  name: string;
  title?: string | null;
  display_name?: string;
};

export type GrapeMindsRegion = {
  id: number;
  name: string;
  country: string;
  language?: string;
};

export type GrapeMindsSearchItem = {
  id: number;
  display_name: string;
  color: string;
  sub_type?: string | null;
  producer: GrapeMindsProducer;
  region: GrapeMindsRegion | null;
};

export type GrapeMindsTextBlock = {
  text: string;
  text_long?: string;
  language?: string;
};

export type GrapeMindsFlavorProfile = {
  sweetness: number;
  acidity: number;
  tannins: number;
  alcohol: number;
  body: number;
  finish: number;
};

export type GrapeMindsWineDetail = GrapeMindsSearchItem & {
  grapes: Array<{ id: number; name: string }>;
  description?: GrapeMindsTextBlock | null;
  pairing?: GrapeMindsTextBlock | null;
  tasting_notes?: GrapeMindsTextBlock | null;
  flavor_profile?: GrapeMindsFlavorProfile | null;
};

export type ExternalWineSearchResult = {
  externalId: number;
  name: string;
  producer: string;
  region: string | undefined;
};

export type ExternalWineFields = {
  name?: string;
  producer?: string;
  type?: WineType;
  region?: string;
  country?: string;
  grape?: string;
};

export type ExternalWineDetail = {
  externalId: number;
  fields: ExternalWineFields;
  description?: string;
  pairing?: string;
  tastingNotes?: string;
  flavorProfile?: GrapeMindsFlavorProfile;
};

export function mapSearchItem(item: GrapeMindsSearchItem): ExternalWineSearchResult {
  return {
    externalId: item.id,
    name: item.display_name,
    producer: item.producer?.name,
    region: item.region?.name,
  };
}

export function mapWineDetail(detail: GrapeMindsWineDetail): ExternalWineDetail {
  return {
    externalId: detail.id,
    fields: {
      name: detail.display_name || undefined,
      producer: detail.producer?.name || undefined,
      type: mapColorToType(detail.color),
      region: detail.region?.name || undefined,
      country: mapCountryCode(detail.region?.country),
      grape: detail.grapes?.[0]?.name || undefined,
    },
    description: detail.description?.text || undefined,
    pairing: detail.pairing?.text || undefined,
    tastingNotes: detail.tasting_notes?.text || undefined,
    flavorProfile: detail.flavor_profile ?? undefined,
  };
}
