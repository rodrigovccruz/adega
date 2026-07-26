import "server-only";
import {
  ExternalWineNotConfiguredError,
  ExternalWineRateLimitError,
  ExternalWineUnavailableError,
} from "@/lib/external-wine/errors";
import type { GrapeMindsSearchItem, GrapeMindsWineDetail } from "@/lib/external-wine/mapping";

const BASE_URL = "https://api.grapeminds.eu/public/v1";
const REQUEST_TIMEOUT_MS = 5_000;

function getApiKey(): string {
  const apiKey = process.env.GRAPEMINDS_API_KEY;
  if (!apiKey) {
    throw new ExternalWineNotConfiguredError();
  }
  return apiKey;
}

async function grapeMindsFetch(path: string): Promise<unknown> {
  const apiKey = getApiKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
  } catch {
    throw new ExternalWineUnavailableError();
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 429) {
    throw new ExternalWineRateLimitError();
  }

  if (!response.ok) {
    throw new ExternalWineUnavailableError();
  }

  return response.json();
}

export async function searchWines(query: string): Promise<GrapeMindsSearchItem[]> {
  const data = (await grapeMindsFetch(
    `/wines?search=${encodeURIComponent(query)}&per_page=10`,
  )) as { data: GrapeMindsSearchItem[] };
  return data.data;
}

export async function getWineDetail(externalId: number): Promise<GrapeMindsWineDetail> {
  const data = (await grapeMindsFetch(`/wines/${externalId}`)) as { data: GrapeMindsWineDetail };
  return data.data;
}
