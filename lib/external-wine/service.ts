import "server-only";
import { ValidationError } from "@/lib/errors";
import { searchCache, detailCache } from "@/lib/external-wine/cache";
import { searchWines, getWineDetail } from "@/lib/external-wine/client";
import {
  mapSearchItem,
  mapWineDetail,
  type ExternalWineSearchResult,
  type ExternalWineDetail,
} from "@/lib/external-wine/mapping";

const MIN_QUERY_LENGTH = 3;

export async function searchExternalWines(
  query: string,
  deps: { search: typeof searchWines } = { search: searchWines },
): Promise<ExternalWineSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    throw new ValidationError(`Digite pelo menos ${MIN_QUERY_LENGTH} caracteres`);
  }

  const cacheKey = trimmed.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const items = await deps.search(trimmed);
  const results = items.map(mapSearchItem);
  searchCache.set(cacheKey, results);
  return results;
}

export async function getExternalWineDetail(
  externalId: number,
  deps: { detail: typeof getWineDetail } = { detail: getWineDetail },
): Promise<ExternalWineDetail> {
  const cacheKey = String(externalId);
  const cached = detailCache.get(cacheKey);
  if (cached) return cached;

  const detail = await deps.detail(externalId);
  const mapped = mapWineDetail(detail);
  detailCache.set(cacheKey, mapped);
  return mapped;
}
