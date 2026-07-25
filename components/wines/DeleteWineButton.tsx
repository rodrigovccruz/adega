"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteWineButton({ wineId, wineName }: { wineId: string; wineName: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir "${wineName}"? Essa ação também remove as harmonizações associadas e não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setPending(true);
    const response = await fetch(`/api/wines/${wineId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/vinhos");
      router.refresh();
    } else {
      setPending(false);
      window.alert("Não foi possível excluir o vinho.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-sm font-medium text-wine-700 border border-wine-700/40 px-3 py-1.5 rounded-md hover:bg-wine-700/10 transition-colors disabled:opacity-60"
    >
      {pending ? "Excluindo…" : "Excluir vinho"}
    </button>
  );
}
