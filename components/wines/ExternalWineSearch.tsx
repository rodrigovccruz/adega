"use client";

import { useState, type FormEvent } from "react";
import type {
  ExternalWineDetail,
  ExternalWineSearchResult,
} from "@/lib/external-wine/mapping";

const FLAVOR_LABELS: Record<keyof NonNullable<ExternalWineDetail["flavorProfile"]>, string> = {
  sweetness: "Doçura",
  acidity: "Acidez",
  tannins: "Taninos",
  alcohol: "Álcool",
  body: "Corpo",
  finish: "Final",
};

export function ExternalWineSearch({
  initialQuery = "",
  onApply,
}: {
  initialQuery?: string;
  onApply: (detail: ExternalWineDetail) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ExternalWineSearchResult[] | null>(null);
  const [selected, setSelected] = useState<ExternalWineDetail | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSelected(null);
    setPending(true);

    try {
      const response = await fetch(`/api/wines/external-search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Não foi possível buscar informações. Tente novamente.");
        setResults(null);
        return;
      }

      setResults(data.results);
      if (data.results.length === 0) {
        setError(`Nenhum vinho encontrado para "${query}"`);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  async function handleSelect(externalId: number) {
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/wines/external/${externalId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Não foi possível buscar informações. Tente novamente.");
        return;
      }

      setSelected(data.wine);
      onApply(data.wine as ExternalWineDetail);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-wine-700/20 bg-cream-200 p-4">
      <p className="text-sm font-medium text-wine-900 mb-1">Buscar em base de vinhos</p>
      <p className="text-xs text-wine-800/70 mb-3">
        Completa campos vazios e mostra descrição, notas de degustação e
        harmonização de referência (fonte: GrapeMinds).
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome ou produtor do vinho"
          className="flex-1 rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine-600"
        />
        <button
          type="submit"
          disabled={pending || query.trim().length < 3}
          className="bg-wine-700 text-cream-100 rounded-md px-4 py-2 text-sm font-medium hover:bg-wine-600 transition-colors disabled:opacity-60"
        >
          {pending ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {error && <p className="text-sm text-wine-700 mb-3">{error}</p>}

      {results && results.length > 0 && !selected && (
        <ul className="space-y-2 mb-3">
          {results.map((result) => (
            <li key={result.externalId}>
              <button
                type="button"
                onClick={() => handleSelect(result.externalId)}
                disabled={pending}
                className="w-full text-left bg-cream-100 hover:bg-cream-300 rounded-md px-3 py-2 text-sm transition-colors disabled:opacity-60"
              >
                <span className="font-medium text-wine-900">{result.name}</span>
                {result.producer && (
                  <span className="text-wine-800/70"> — {result.producer}</span>
                )}
                {result.region && (
                  <span className="text-wine-800/60 text-xs"> ({result.region})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="bg-cream-100 rounded-md p-3 text-sm space-y-2">
          <p className="font-medium text-wine-900">{selected.fields.name}</p>

          {selected.description && (
            <p className="text-wine-800/80">
              <span className="font-medium">Descrição: </span>
              {selected.description}
            </p>
          )}
          {selected.tastingNotes && (
            <p className="text-wine-800/80">
              <span className="font-medium">Notas de degustação: </span>
              {selected.tastingNotes}
            </p>
          )}
          {selected.pairing && (
            <p className="text-wine-800/80">
              <span className="font-medium">Harmonização sugerida: </span>
              {selected.pairing}
            </p>
          )}

          {selected.flavorProfile && (
            <div>
              <p className="font-medium text-wine-900 mb-1">Perfil de sabor</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                {(
                  Object.entries(selected.flavorProfile) as [
                    keyof typeof FLAVOR_LABELS,
                    number,
                  ][]
                ).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-wine-800/70">{FLAVOR_LABELS[key]}</span>
                    <span className="font-medium text-wine-900">{value}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gold-500 font-medium">Fonte: GrapeMinds</p>
        </div>
      )}
    </div>
  );
}
