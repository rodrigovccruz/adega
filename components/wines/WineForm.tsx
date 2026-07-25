"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { wineTypes, wineTypeLabels } from "@/lib/validation/wine";

export type WineFormValues = {
  name: string;
  producer: string;
  type: string;
  grape: string;
  country: string;
  region: string;
  vintage: string;
  alcoholPct: string;
  quantity: string;
  purchasePrice: string;
  location: string;
  notes: string;
};

const emptyValues: WineFormValues = {
  name: "",
  producer: "",
  type: "tinto",
  grape: "",
  country: "",
  region: "",
  vintage: "",
  alcoholPct: "",
  quantity: "0",
  purchasePrice: "",
  location: "",
  notes: "",
};

function toPayload(values: WineFormValues) {
  return {
    name: values.name,
    producer: values.producer,
    type: values.type,
    grape: values.grape || undefined,
    country: values.country || undefined,
    region: values.region || undefined,
    vintage: values.vintage ? Number(values.vintage) : undefined,
    alcoholPct: values.alcoholPct ? Number(values.alcoholPct) : undefined,
    quantity: Number(values.quantity || 0),
    purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
    location: values.location || undefined,
    notes: values.notes || undefined,
  };
}

export function WineForm({
  wineId,
  initialValues,
}: {
  wineId?: string;
  initialValues?: Partial<WineFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<WineFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isEdit = Boolean(wineId);

  function update<K extends keyof WineFormValues>(key: K, value: WineFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(isEdit ? `/api/wines/${wineId}` : "/api/wines", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(values)),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Não foi possível salvar o vinho");
        return;
      }

      const savedId = isEdit ? wineId : data.wine.id;
      router.push(`/vinhos/${savedId}`);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine-600";
  const labelClass = "block text-sm font-medium text-wine-900 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p
          role="alert"
          className="rounded-md bg-wine-700/10 border border-wine-700/30 text-wine-800 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nome *
          </label>
          <input
            id="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="Ex.: Malbec Reserva 2020"
          />
        </div>

        <div>
          <label htmlFor="producer" className={labelClass}>
            Produtor *
          </label>
          <input
            id="producer"
            required
            value={values.producer}
            onChange={(e) => update("producer", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="type" className={labelClass}>
            Tipo *
          </label>
          <select
            id="type"
            required
            value={values.type}
            onChange={(e) => update("type", e.target.value)}
            className={inputClass}
          >
            {wineTypes.map((type) => (
              <option key={type} value={type}>
                {wineTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="grape" className={labelClass}>
            Uva
          </label>
          <input
            id="grape"
            value={values.grape}
            onChange={(e) => update("grape", e.target.value)}
            className={inputClass}
            placeholder="Pode ser um blend"
          />
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>
            País
          </label>
          <input
            id="country"
            value={values.country}
            onChange={(e) => update("country", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="region" className={labelClass}>
            Região
          </label>
          <input
            id="region"
            value={values.region}
            onChange={(e) => update("region", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="vintage" className={labelClass}>
            Safra
          </label>
          <input
            id="vintage"
            type="number"
            value={values.vintage}
            onChange={(e) => update("vintage", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="alcoholPct" className={labelClass}>
            Teor alcoólico (%)
          </label>
          <input
            id="alcoholPct"
            type="number"
            step="0.1"
            value={values.alcoholPct}
            onChange={(e) => update("alcoholPct", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="quantity" className={labelClass}>
            Quantidade *
          </label>
          <input
            id="quantity"
            type="number"
            min={0}
            required
            value={values.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="purchasePrice" className={labelClass}>
            Preço de compra
          </label>
          <input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={values.purchasePrice}
            onChange={(e) => update("purchasePrice", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            Localização
          </label>
          <input
            id="location"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            className={inputClass}
            placeholder="Ex.: Prateleira A3"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notas
        </label>
        <textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-wine-700 text-cream-100 rounded-md px-6 py-2.5 font-medium hover:bg-wine-600 transition-colors disabled:opacity-60"
      >
        {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Cadastrar vinho"}
      </button>
    </form>
  );
}
