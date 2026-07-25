"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function QuantityAdjuster({ wineId, quantity }: { wineId: string; quantity: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function adjust(delta: number) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/wines/${wineId}/quantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Não foi possível ajustar a quantidade");
      setPending(false);
      return;
    }
    setPending(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={pending || quantity <= 0}
          className="w-9 h-9 rounded-md border border-wine-700/40 text-wine-800 font-bold hover:bg-wine-700/10 disabled:opacity-40 transition-colors"
          aria-label="Diminuir quantidade"
        >
          −
        </button>
        <span className="text-2xl font-display text-wine-900 min-w-[3ch] text-center">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => adjust(1)}
          disabled={pending}
          className="w-9 h-9 rounded-md border border-wine-700/40 text-wine-800 font-bold hover:bg-wine-700/10 disabled:opacity-40 transition-colors"
          aria-label="Aumentar quantidade"
        >
          +
        </button>
        <span className="text-sm text-wine-800/70">
          garrafa{quantity === 1 ? "" : "s"} em estoque
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-wine-700">{error}</p>}
    </div>
  );
}
