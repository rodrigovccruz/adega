import { describe, expect, it } from "vitest";
import { TtlCache } from "@/lib/external-wine/cache";

describe("TtlCache", () => {
  it("retorna undefined para chave não cacheada", () => {
    const cache = new TtlCache<string>();
    expect(cache.get("qualquer")).toBeUndefined();
  });

  it("retorna o valor guardado antes de expirar", () => {
    let now = 0;
    const cache = new TtlCache<string>(() => now);

    cache.set("malbec", "resultado");
    now += 1000 * 60 * 30; // 30 minutos depois, ainda dentro da 1h de TTL

    expect(cache.get("malbec")).toBe("resultado");
  });

  it("expira após o TTL de 1 hora", () => {
    let now = 0;
    const cache = new TtlCache<string>(() => now);

    cache.set("malbec", "resultado");
    now += 1000 * 60 * 61; // 61 minutos depois

    expect(cache.get("malbec")).toBeUndefined();
  });
});
