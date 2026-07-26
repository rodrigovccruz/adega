import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getWine } from "@/lib/wines/service";
import { NotFoundError } from "@/lib/errors";
import { WineForm } from "@/components/wines/WineForm";

type RouteParams = { params: Promise<{ id: string }> };

export default async function EditarVinhoPage({ params }: RouteParams) {
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl text-wine-900 mb-6">Editar vinho</h1>
      <WineForm
        wineId={wine.id}
        initialValues={{
          name: wine.name,
          producer: wine.producer,
          type: wine.type,
          grape: wine.grape ?? "",
          country: wine.country ?? "",
          region: wine.region ?? "",
          vintage: wine.vintage?.toString() ?? "",
          alcoholPct: wine.alcoholPct?.toString() ?? "",
          quantity: wine.quantity.toString(),
          purchasePrice: wine.purchasePrice?.toString() ?? "",
          location: wine.location ?? "",
          notes: wine.notes ?? "",
          labelPhotoUrl: wine.labelPhotoUrl ?? "",
        }}
      />
    </div>
  );
}
