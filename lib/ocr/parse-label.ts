import { wineTypes, type WineInput } from "@/lib/validation/wine";

export type OcrLine = {
  text: string;
  height: number;
};

export type LabelSuggestion = Partial<
  Pick<WineInput, "name" | "producer" | "vintage" | "type">
>;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_VINTAGE_YEAR = 1900;

const TYPE_KEYWORDS: Record<(typeof wineTypes)[number], string[]> = {
  tinto: ["tinto", "red wine", "vinho tinto"],
  branco: ["branco", "white wine", "vinho branco"],
  rose: ["rose", "rosé", "rosado"],
  espumante: ["espumante", "champagne", "prosecco", "cava", "sparkling"],
  fortificado: ["fortificado", "porto", "port wine", "sherry", "jerez", "madeira"],
  outro: [],
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findVintage(fullText: string): number | undefined {
  const matches = fullText.match(/\b(19|20)\d{2}\b/g);
  if (!matches) return undefined;

  const candidates = matches
    .map((match) => Number(match))
    .filter((year) => year >= MIN_VINTAGE_YEAR && year <= CURRENT_YEAR + 1);

  return candidates[0];
}

function findType(fullText: string): (typeof wineTypes)[number] | undefined {
  const normalized = normalize(fullText);

  for (const type of wineTypes) {
    if (type === "outro") continue;
    const keywords = TYPE_KEYWORDS[type];
    if (keywords.some((keyword) => normalized.includes(normalize(keyword)))) {
      return type;
    }
  }

  return undefined;
}

/**
 * Heurística best-effort (spec 04): a linha com maior altura de bounding box
 * costuma ser o nome do rótulo em destaque; a segunda linha mais alta e
 * distinta vira candidata a produtor. Sem garantia de acerto.
 */
export function parseLabelFields(lines: OcrLine[]): LabelSuggestion {
  const cleanedLines = lines
    .map((line) => ({ ...line, text: line.text.trim() }))
    .filter((line) => line.text.length >= 2);

  const fullText = cleanedLines.map((line) => line.text).join("\n");

  const sortedByHeight = [...cleanedLines].sort((a, b) => b.height - a.height);

  const suggestion: LabelSuggestion = {};

  const nameLine = sortedByHeight[0];
  if (nameLine) {
    suggestion.name = nameLine.text;
  }

  const producerLine = sortedByHeight.find(
    (line) => line.text.toLowerCase() !== nameLine?.text.toLowerCase(),
  );
  if (producerLine) {
    suggestion.producer = producerLine.text;
  }

  const vintage = findVintage(fullText);
  if (vintage !== undefined) {
    suggestion.vintage = vintage;
  }

  const type = findType(fullText);
  if (type !== undefined) {
    suggestion.type = type;
  }

  return suggestion;
}
