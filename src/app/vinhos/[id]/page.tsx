import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { deleteWineAction, updateQuantityAction } from "@/actions/wines";
import { createPairingAction, deletePairingAction } from "@/actions/pairings";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { PairingForm } from "@/components/PairingForm";
import { QuantityForm } from "@/components/QuantityForm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  PAIRING_CATEGORY_LABELS,
  PAIRING_INTENSITY_LABELS,
  WINE_TYPE_LABELS,
} from "@/lib/labels";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const wine = await prisma.wine.findUnique({ where: { id } });
  return { title: wine?.name ?? "Vinho" };
}

export default async function WineDetailPage({ params }: { params: Params }) {
  const user = await requireUser();
  const { id } = await params;

  const wine = await prisma.wine.findFirst({
    where: { id, userId: user.id },
    include: { pairings: { orderBy: { createdAt: "desc" } } },
  });

  if (!wine) {
    notFound();
  }

  const boundQuantity = updateQuantityAction.bind(null, wine.id);
  const boundCreatePairing = createPairingAction.bind(null, wine.id);
  const boundDeleteWine = deleteWineAction.bind(null, wine.id);

  return (
    <div className="container stack-lg" style={{ paddingBlock: "2.5rem" }}>
      <div className="stack">
        <Link href="/vinhos" className="muted">
          ← Voltar para a adega
        </Link>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          <div className="stack">
            <p className="eyebrow">{WINE_TYPE_LABELS[wine.type]}</p>
            <h1 className="display" style={{ margin: 0, fontSize: "clamp(2.3rem, 5vw, 3.6rem)" }}>
              {wine.name}
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "1.1rem" }}>
              {wine.producer}
              {wine.vintage ? ` · Safra ${wine.vintage}` : ""}
              {wine.grape ? ` · ${wine.grape}` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <Link href={`/vinhos/${wine.id}/editar`} className="btn btn-secondary btn-small">
              Editar
            </Link>
            <form action={boundDeleteWine}>
              <ConfirmDeleteButton confirmMessage="Excluir este vinho e todas as sugestões?" />
            </form>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        <div className="panel stack">
          <h2 className="display" style={{ margin: 0, fontSize: "1.4rem" }}>
            Detalhes
          </h2>
          <dl className="stack" style={{ margin: 0 }}>
            <div>
              <dt className="eyebrow">País / Região</dt>
              <dd style={{ margin: "0.2rem 0 0" }}>
                {[wine.country, wine.region].filter(Boolean).join(" · ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Teor alcoólico</dt>
              <dd style={{ margin: "0.2rem 0 0" }}>
                {wine.alcoholPct != null ? `${wine.alcoholPct}%` : "—"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Localização</dt>
              <dd style={{ margin: "0.2rem 0 0" }}>{wine.location || "—"}</dd>
            </div>
            <div>
              <dt className="eyebrow">Preço de compra</dt>
              <dd style={{ margin: "0.2rem 0 0" }}>
                {wine.purchasePrice != null
                  ? wine.purchasePrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "—"}
              </dd>
            </div>
            {wine.notes ? (
              <div>
                <dt className="eyebrow">Notas</dt>
                <dd style={{ margin: "0.2rem 0 0" }}>{wine.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <QuantityForm quantity={wine.quantity} action={boundQuantity} />
      </div>

      <section className="stack-lg">
        <div className="stack">
          <h2 className="display" style={{ margin: 0, fontSize: "2rem" }}>
            Harmonizações
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            Sugestões gastronômicas associadas a este rótulo.
          </p>
        </div>

        {wine.pairings.length === 0 ? (
          <div className="panel">
            <p className="muted" style={{ margin: 0 }}>
              Ainda não há sugestões. Adicione a primeira harmonização abaixo.
            </p>
          </div>
        ) : (
          <div className="stack">
            {wine.pairings.map((pairing) => (
              <article key={pairing.id} className="panel stack">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 className="display" style={{ margin: 0, fontSize: "1.35rem" }}>
                      {pairing.title}
                    </h3>
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.45rem" }}>
                      <span className="tag">
                        {PAIRING_CATEGORY_LABELS[pairing.category]}
                      </span>
                      {pairing.intensity ? (
                        <span className="tag">
                          {PAIRING_INTENSITY_LABELS[pairing.intensity]}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await deletePairingAction(pairing.id, wine.id);
                    }}
                  >
                    <button type="submit" className="btn btn-danger btn-small">
                      Remover
                    </button>
                  </form>
                </div>
                {pairing.description ? (
                  <p className="muted" style={{ margin: 0 }}>
                    {pairing.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}

        <PairingForm action={boundCreatePairing} />
      </section>
    </div>
  );
}
