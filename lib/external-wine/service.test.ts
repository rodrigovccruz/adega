import { describe, expect, it, vi } from "vitest";
import { searchExternalWines, getExternalWineDetail } from "@/lib/external-wine/service";
import { ValidationError } from "@/lib/errors";
import {
  ExternalWineRateLimitError,
  ExternalWineUnavailableError,
} from "@/lib/external-wine/errors";
import type { GrapeMindsSearchItem, GrapeMindsWineDetail } from "@/lib/external-wine/mapping";

const sampleSearchItem: GrapeMindsSearchItem = {
  id: 42,
  display_name: "Malbec Reserva",
  color: "red",
  producer: { id: 1, name: "Bodega X" },
  region: { id: 1, name: "Mendoza", country: "ar" },
};

const sampleDetail: GrapeMindsWineDetail = {
  ...sampleSearchItem,
  grapes: [{ id: 1, name: "Malbec" }],
  description: { text: "Um malbec encorpado" },
  pairing: { text: "Carnes vermelhas" },
  tasting_notes: { text: "Frutas escuras e especiarias" },
  flavor_profile: { sweetness: 2, acidity: 5, tannins: 7, alcohol: 6, body: 8, finish: 7 },
};

describe("searchExternalWines", () => {
  it("rejeita termo com menos de 3 caracteres", async () => {
    await expect(searchExternalWines("ab")).rejects.toBeInstanceOf(ValidationError);
  });

  it("busca, mapeia e cacheia o resultado (query única por teste)", async () => {
    const search = vi.fn().mockResolvedValue([sampleSearchItem]);

    const first = await searchExternalWines("malbec-cache-test-1", { search });
    expect(first).toEqual([
      { externalId: 42, name: "Malbec Reserva", producer: "Bodega X", region: "Mendoza" },
    ]);
    expect(search).toHaveBeenCalledTimes(1);

    const second = await searchExternalWines("malbec-cache-test-1", { search });
    expect(second).toEqual(first);
    expect(search).toHaveBeenCalledTimes(1); // reaproveitou o cache, não chamou de novo
  });

  it("propaga rate limit da API externa", async () => {
    const search = vi.fn().mockRejectedValue(new ExternalWineRateLimitError());
    await expect(
      searchExternalWines("malbec-cache-test-rate-limit", { search }),
    ).rejects.toBeInstanceOf(ExternalWineRateLimitError);
  });

  it("propaga indisponibilidade/erro de rede da API externa", async () => {
    const search = vi.fn().mockRejectedValue(new ExternalWineUnavailableError());
    await expect(
      searchExternalWines("malbec-cache-test-unavailable", { search }),
    ).rejects.toBeInstanceOf(ExternalWineUnavailableError);
  });

  it("retorna lista vazia quando não há resultados (sem erro)", async () => {
    const search = vi.fn().mockResolvedValue([]);
    const result = await searchExternalWines("malbec-cache-test-empty", { search });
    expect(result).toEqual([]);
  });
});

describe("getExternalWineDetail", () => {
  it("busca, mapeia e cacheia o detalhe", async () => {
    const detail = vi.fn().mockResolvedValue(sampleDetail);

    const first = await getExternalWineDetail(9001, { detail });
    expect(first.fields.type).toBe("tinto");
    expect(first.fields.country).toBe("Argentina");
    expect(first.description).toBe("Um malbec encorpado");
    expect(first.flavorProfile).toEqual(sampleDetail.flavor_profile);
    expect(detail).toHaveBeenCalledTimes(1);

    const second = await getExternalWineDetail(9001, { detail });
    expect(second).toEqual(first);
    expect(detail).toHaveBeenCalledTimes(1);
  });
});
