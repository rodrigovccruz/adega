"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  suggestionCategories,
  suggestionCategoryLabels,
  suggestionIntensities,
  suggestionIntensityLabels,
} from "@/lib/validation/pairing";

export type PairingDTO = {
  id: string;
  title: string;
  category: (typeof suggestionCategories)[number];
  description: string | null;
  intensity: (typeof suggestionIntensities)[number] | null;
};

type PairingFormValues = {
  title: string;
  category: (typeof suggestionCategories)[number];
  description: string;
  intensity: string;
};

const emptyForm: PairingFormValues = {
  title: "",
  category: suggestionCategories[0],
  description: "",
  intensity: "",
};

function PairingForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: typeof emptyForm;
  onCancel: () => void;
  onSubmit: (values: typeof emptyForm) => Promise<void>;
}) {
  const [values, setValues] = useState(initial ?? emptyForm);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar sugestão");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wine-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-cream-200 rounded-lg p-4 border border-wine-700/15">
      {error && <p className="text-sm text-wine-700">{error}</p>}

      <div>
        <label className="block text-xs font-medium text-wine-900 mb-1">Título *</label>
        <input
          required
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          className={inputClass}
          placeholder="Ex.: Risoto de cogumelos"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-wine-900 mb-1">Categoria *</label>
          <select
            required
            value={values.category}
            onChange={(e) =>
              setValues((v) => ({ ...v, category: e.target.value as typeof v.category }))
            }
            className={inputClass}
          >
            {suggestionCategories.map((category) => (
              <option key={category} value={category}>
                {suggestionCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-wine-900 mb-1">Intensidade</label>
          <select
            value={values.intensity}
            onChange={(e) => setValues((v) => ({ ...v, intensity: e.target.value }))}
            className={inputClass}
          >
            <option value="">—</option>
            {suggestionIntensities.map((intensity) => (
              <option key={intensity} value={intensity}>
                {suggestionIntensityLabels[intensity]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-wine-900 mb-1">Descrição</label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          className={inputClass}
          placeholder="Por que combina"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-wine-700 text-cream-100 rounded-md px-4 py-1.5 text-sm font-medium hover:bg-wine-600 transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-wine-800 px-3 py-1.5 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function PairingsSection({
  wineId,
  initialPairings,
}: {
  wineId: string;
  initialPairings: PairingDTO[];
}) {
  const router = useRouter();
  const [pairings, setPairings] = useState(initialPairings);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(values: typeof emptyForm) {
    const response = await fetch(`/api/wines/${wineId}/pairings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        category: values.category,
        description: values.description || undefined,
        intensity: values.intensity || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Não foi possível adicionar a sugestão");
    }
    setPairings((prev) => [data.pairing, ...prev]);
    setAdding(false);
    router.refresh();
  }

  async function handleUpdate(pairingId: string, values: typeof emptyForm) {
    const response = await fetch(`/api/pairings/${pairingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        category: values.category,
        description: values.description || undefined,
        intensity: values.intensity || undefined,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Não foi possível editar a sugestão");
    }
    setPairings((prev) => prev.map((p) => (p.id === pairingId ? data.pairing : p)));
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(pairingId: string) {
    const confirmed = window.confirm("Remover esta sugestão gastronômica?");
    if (!confirmed) return;

    const response = await fetch(`/api/pairings/${pairingId}`, { method: "DELETE" });
    if (response.ok) {
      setPairings((prev) => prev.filter((p) => p.id !== pairingId));
      router.refresh();
    } else {
      window.alert("Não foi possível remover a sugestão.");
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-wine-900">Harmonizações</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-sm font-medium bg-gold-500 text-wine-950 px-3 py-1.5 rounded-md hover:bg-gold-400 transition-colors"
          >
            + Adicionar sugestão
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4">
          <PairingForm onCancel={() => setAdding(false)} onSubmit={handleCreate} />
        </div>
      )}

      {pairings.length === 0 && !adding && (
        <p className="text-wine-800/70 text-sm border border-dashed border-wine-700/30 rounded-lg p-4">
          Nenhuma harmonização cadastrada ainda para este vinho.
        </p>
      )}

      <ul className="space-y-3">
        {pairings.map((pairing) =>
          editingId === pairing.id ? (
            <li key={pairing.id}>
              <PairingForm
                initial={{
                  title: pairing.title,
                  category: pairing.category,
                  description: pairing.description ?? "",
                  intensity: pairing.intensity ?? "",
                }}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) => handleUpdate(pairing.id, values)}
              />
            </li>
          ) : (
            <li
              key={pairing.id}
              className="bg-cream-200 rounded-lg p-4 border border-wine-700/15 flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-wine-900">{pairing.title}</h3>
                  <span className="text-xs bg-wine-800 text-cream-100 px-2 py-0.5 rounded-full">
                    {suggestionCategoryLabels[pairing.category]}
                  </span>
                  {pairing.intensity && (
                    <span className="text-xs text-gold-500 font-medium">
                      {suggestionIntensityLabels[pairing.intensity]}
                    </span>
                  )}
                </div>
                {pairing.description && (
                  <p className="text-sm text-wine-800/80">{pairing.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(pairing.id)}
                  className="text-xs font-medium text-wine-700 hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pairing.id)}
                  className="text-xs font-medium text-wine-700 hover:underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
