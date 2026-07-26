import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getWine } from "@/lib/wines/service";
import { NotFoundError } from "@/lib/errors";
import { wineTypeLabels } from "@/lib/validation/wine";
import { QuantityAdjuster } from "@/components/wines/QuantityAdjuster";
import { DeleteWineButton } from "@/components/wines/DeleteWineButton";
import { PairingsSection } from "@/components/pairings/PairingsSection";
import { MarketInfoPanel } from "@/components/wines/MarketInfoPanel";

type RouteParams = { params: Promise<{ id: string }> };

export default async function VinhoDetalhePage({ params }: RouteParams) {
  const user = await requireCurrentUser();
  const { id } = await params;

  let wine;
  try {
    wine = await getWine(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const details: Array<[string, string | number | null | undefined]> = [
    ["Uva", wine.grape],
    ["País", wine.country],
    ["Região", wine.region],
    ["Safra", wine.vintage],
    ["Teor alcoólico", wine.alcoholPct ? `${wine.alcoholPct}%` : null],
    ["Preço de compra", wine.purchasePrice ? `R$ ${wine.purchasePrice.toFixed(2)}` : null],
    ["Localização", wine.location],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-4">
        <Link href="/vinhos" className="text-sm text-wine-800 hover:underline">
          ← Voltar para a adega
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-start gap-4">
          {wine.labelPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wine.labelPhotoUrl}
              alt={`Rótulo de ${wine.name}`}
              className="w-20 h-20 object-cover rounded-md border border-wine-700/20"
            />
          )}
          <div>
            <span className="text-xs font-medium bg-wine-800 text-cream-100 px-2 py-1 rounded-full">
              {wineTypeLabels[wine.type]}
            </span>
            <h1 className="font-display text-4xl text-wine-900 mt-2">{wine.name}</h1>
            <p className="text-wine-800/80">{wine.producer}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/vinhos/${wine.id}/editar`}
            className="text-sm font-medium border border-wine-700/40 text-wine-800 px-3 py-1.5 rounded-md hover:bg-wine-700/10 transition-colors"
          >
            Editar
          </Link>
          <DeleteWineButton wineId={wine.id} wineName={wine.name} />
        </div>
      </div>

      <div className="mb-8">
        <QuantityAdjuster wineId={wine.id} quantity={wine.quantity} />
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-sm">
        {details
          .filter(([, value]) => value !== null && value !== undefined && value !== "")
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-wine-800/60">{label}</dt>
              <dd className="text-wine-950 font-medium">{value}</dd>
            </div>
          ))}
      </dl>

      {wine.notes && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-wine-800/60 mb-1">Notas</h2>
          <p className="text-wine-950">{wine.notes}</p>
        </div>
      )}

      <div className="mb-8">
        <MarketInfoPanel
          wineId={wine.id}
          currentFields={{
            name: wine.name,
            producer: wine.producer,
            region: wine.region,
            country: wine.country,
            grape: wine.grape,
          }}
        />
      </div>

      <PairingsSection
        wineId={wine.id}
        initialPairings={wine.pairings.map((pairing) => ({
          id: pairing.id,
          title: pairing.title,
          category: pairing.category,
          description: pairing.description,
          intensity: pairing.intensity,
        }))}
      />
    </div>
  );
}
