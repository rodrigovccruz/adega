"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalWineSearch } from "@/components/wines/ExternalWineSearch";
import type { ExternalWineDetail } from "@/lib/external-wine/mapping";

type CurrentFields = {
  name: string;
  producer: string;
  region: string | null;
  country: string | null;
  grape: string | null;
};

export function MarketInfoPanel({
  wineId,
  currentFields,
}: {
  wineId: string;
  currentFields: CurrentFields;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ExternalWineDetail | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const hasEmptyFields =
    !currentFields.region || !currentFields.country || !currentFields.grape;

  async function handleApply() {
    if (!selected) return;
    setApplying(true);

    const patch: Record<string, string> = {};
    if (!currentFields.region && selected.fields.region) patch.region = selected.fields.region;
    if (!currentFields.country && selected.fields.country) patch.country = selected.fields.country;
    if (!currentFields.grape && selected.fields.grape) patch.grape = selected.fields.grape;

    try {
      const response = await fetch(`/api/wines/${wineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (response.ok) {
        setApplied(true);
        router.refresh();
      }
    } finally {
      setApplying(false);
    }
  }

  return (
    <section>
      <h2 className="font-display text-2xl text-wine-900 mb-4">Informações de mercado</h2>
      <ExternalWineSearch
        initialQuery={currentFields.name}
        onApply={(detail) => {
          setSelected(detail);
          setApplied(false);
        }}
      />

      {selected && hasEmptyFields && (
        <button
          type="button"
          onClick={handleApply}
          disabled={applying || applied}
          className="mt-3 text-sm font-medium bg-wine-700 text-cream-100 px-4 py-2 rounded-md hover:bg-wine-600 transition-colors disabled:opacity-60"
        >
          {applied ? "Aplicado ao cadastro" : applying ? "Aplicando…" : "Aplicar campos vazios ao cadastro"}
        </button>
      )}
    </section>
  );
}
