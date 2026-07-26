import "server-only";

const TTL_MS = 60 * 60 * 1000; // 1 hora

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * Cache em memória de processo, sem persistência em banco (spec 05: EXT-N3).
 * Reinício do servidor limpa o cache — é só uma otimização de custo.
 */
export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private now: () => number = Date.now) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: this.now() + TTL_MS });
  }
}

export const searchCache = new TtlCache<import("./mapping").ExternalWineSearchResult[]>();
export const detailCache = new TtlCache<import("./mapping").ExternalWineDetail>();
