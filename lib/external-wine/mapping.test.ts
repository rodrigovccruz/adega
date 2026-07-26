import { describe, expect, it } from "vitest";
import {
  mapColorToType,
  mapCountryCode,
  mapSearchItem,
  mapWineDetail,
  type GrapeMindsSearchItem,
  type GrapeMindsWineDetail,
} from "@/lib/external-wine/mapping";

describe("mapColorToType", () => {
  it("mapeia as cores conhecidas da GrapeMinds", () => {
    expect(mapColorToType("red")).toBe("tinto");
    expect(mapColorToType("white")).toBe("branco");
    expect(mapColorToType("rose")).toBe("rose");
    expect(mapColorToType("sparkling")).toBe("espumante");
    expect(mapColorToType("fortified")).toBe("fortificado");
  });

  it("usa 'outro' para cor desconhecida ou ausente", () => {
    expect(mapColorToType("orange")).toBe("outro");
    expect(mapColorToType(null)).toBe("outro");
    expect(mapColorToType(undefined)).toBe("outro");
  });
});

describe("mapCountryCode", () => {
  it("converte código ISO conhecido para nome em PT-BR", () => {
    expect(mapCountryCode("fr")).toBe("França");
    expect(mapCountryCode("PT")).toBe("Portugal");
  });

  it("usa o próprio código em maiúsculas quando não mapeado", () => {
    expect(mapCountryCode("xx")).toBe("XX");
  });

  it("retorna undefined para código ausente", () => {
    expect(mapCountryCode(null)).toBeUndefined();
    expect(mapCountryCode(undefined)).toBeUndefined();
  });
});

const searchItem: GrapeMindsSearchItem = {
  id: 1,
  display_name: "Schieferkopf, Lieu Dit Buehl Riesling",
  color: "white",
  sub_type: "still",
  producer: { id: 1, name: "Schieferkopf" },
  region: { id: 1, name: "Alsace", country: "fr" },
};

describe("mapSearchItem", () => {
  it("extrai nome, produtor e região do resultado de busca", () => {
    const result = mapSearchItem(searchItem);
    expect(result).toEqual({
      externalId: 1,
      name: "Schieferkopf, Lieu Dit Buehl Riesling",
      producer: "Schieferkopf",
      region: "Alsace",
    });
  });

  it("lida com região ausente", () => {
    const result = mapSearchItem({ ...searchItem, region: null });
    expect(result.region).toBeUndefined();
  });
});

const wineDetail: GrapeMindsWineDetail = {
  ...searchItem,
  grapes: [{ id: 1, name: "Riesling" }, { id: 2, name: "Gewürztraminer" }],
  description: { text: "Descrição curta", text_long: "Descrição longa" },
  pairing: { text: "Frutos do mar" },
  tasting_notes: { text: "Cítrico e mineral" },
  flavor_profile: { sweetness: 1, acidity: 8, tannins: 1, alcohol: 4, body: 5, finish: 7 },
};

describe("mapWineDetail", () => {
  it("mapeia campos do vinho, primeira uva, e conteúdo de referência", () => {
    const result = mapWineDetail(wineDetail);

    expect(result.fields).toEqual({
      name: "Schieferkopf, Lieu Dit Buehl Riesling",
      producer: "Schieferkopf",
      type: "branco",
      region: "Alsace",
      country: "França",
      grape: "Riesling",
    });
    expect(result.description).toBe("Descrição curta");
    expect(result.pairing).toBe("Frutos do mar");
    expect(result.tastingNotes).toBe("Cítrico e mineral");
    expect(result.flavorProfile).toEqual(wineDetail.flavor_profile);
  });

  it("não quebra quando descrição/notas/harmonização/perfil de sabor estão ausentes", () => {
    const result = mapWineDetail({ ...wineDetail, description: null, pairing: null, tasting_notes: null, flavor_profile: null, grapes: [] });
    expect(result.description).toBeUndefined();
    expect(result.pairing).toBeUndefined();
    expect(result.tastingNotes).toBeUndefined();
    expect(result.flavorProfile).toBeUndefined();
    expect(result.fields.grape).toBeUndefined();
  });
});
