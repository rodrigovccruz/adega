import type { Metadata } from "next";
import Link from "next/link";
import { createWineAction } from "@/actions/wines";
import { WineForm } from "@/components/WineForm";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Novo vinho",
};

export default async function NewWinePage() {
  await requireUser();

  return (
    <div className="container stack-lg" style={{ paddingBlock: "2.5rem", maxWidth: "860px" }}>
      <div className="stack">
        <Link href="/vinhos" className="muted">
          ← Voltar para a adega
        </Link>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Novo vinho
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Cadastre o rótulo. Depois você associa as harmonizações no detalhe.
        </p>
      </div>
      <WineForm action={createWineAction} submitLabel="Salvar vinho" />
    </div>
  );
}
