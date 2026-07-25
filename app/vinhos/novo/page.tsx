import { requireCurrentUser } from "@/lib/auth/current-user";
import { WineForm } from "@/components/wines/WineForm";

export const metadata = {
  title: "Novo vinho — Adega",
};

export default async function NovoVinhoPage() {
  await requireCurrentUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl text-wine-900 mb-6">Cadastrar vinho</h1>
      <WineForm />
    </div>
  );
}
