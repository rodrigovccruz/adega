"use client";

import { useRef, useState } from "react";
import type { LabelSuggestion } from "@/lib/ocr/parse-label";

export type LabelScanResult = {
  labelPhotoUrl: string;
  suggested: LabelSuggestion;
};

export function LabelScanner({
  photoUrl,
  onScanned,
}: {
  photoUrl?: string;
  onScanned: (result: LabelScanResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/wines/label-scan", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Não foi possível processar a foto do rótulo");
        return;
      }

      onScanned(data as LabelScanResult);
    } catch {
      setError("Erro de conexão ao enviar a foto. Tente novamente.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-wine-700/20 bg-cream-200 p-4">
      <div className="flex items-start gap-4 flex-wrap">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="Foto do rótulo"
            className="w-24 h-24 object-cover rounded-md border border-wine-700/20"
          />
        )}

        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-medium text-wine-900 mb-1">Foto do rótulo</p>
          <p className="text-xs text-wine-800/70 mb-2">
            Tire uma foto do rótulo para tentar preencher nome, produtor, safra e
            tipo automaticamente. Revise sempre antes de salvar — o reconhecimento
            é aproximado.
          </p>

          <label className="inline-block cursor-pointer text-sm font-medium bg-gold-500 text-wine-950 px-3 py-1.5 rounded-md hover:bg-gold-400 transition-colors">
            {pending ? "Analisando foto…" : photoUrl ? "Trocar foto" : "Escanear rótulo"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFileChange}
              disabled={pending}
              className="hidden"
            />
          </label>

          {error && <p className="mt-2 text-sm text-wine-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
