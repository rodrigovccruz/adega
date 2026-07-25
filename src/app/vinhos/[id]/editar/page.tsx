import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { updateWineAction } from "@/actions/wines";
import { WineForm } from "@/components/WineForm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Editar vinho",
};

export default async function EditWinePage({ params }: { params: Params }) {
  const user = await requireUser();
  const { id } = await params;

  const wine = await prisma.wine.findFirst({
    where: { id, userId: user.id },
  });

  if (!wine) {
    notFound();
  }

  const boundUpdate = updateWineAction.bind(null, wine.id);

  return (
    <div className="container stack-lg" style={{ paddingBlock: "2.5rem", maxWidth: "860px" }}>
      <div className="stack">
        <Link href={`/vinhos/${wine.id}`} className="muted">
          ← Voltar ao vinho
        </Link>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Editar vinho
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          {wine.name}
        </p>
      </div>
      <WineForm wine={wine} action={boundUpdate} submitLabel="Salvar alterações" />
    </div>
  );
}
