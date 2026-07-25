import Link from "next/link";
import type { Metadata } from "next";
import { listWinesForUser } from "@/actions/wines";
import { requireUser } from "@/lib/session";
import {
  PAIRING_CATEGORIES,
  PAIRING_CATEGORY_LABELS,
  WINE_TYPE_LABELS,
  WINE_TYPES,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Minha adega",
};

type SearchParams = Promise<{
  q?: string;
  type?: string;
  inStock?: string;
  pairingCategory?: string;
  sort?: string;
}>;

export default async function WinesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const wines = await listWinesForUser(user.id, params);

  return (
    <div className="container stack-lg" style={{ paddingBlock: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "end",
        }}
      >
        <div className="stack fade-up">
          <p className="eyebrow">Sua coleção</p>
          <h1 className="display" style={{ margin: 0, fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
            Adega
          </h1>
          <p className="muted" style={{ margin: 0, maxWidth: "42ch" }}>
            Busque por rótulo, uva ou prato. Filtre por tipo e harmonização.
          </p>
        </div>
        <Link href="/vinhos/novo" className="btn btn-primary fade-up-delay">
          Adicionar vinho
        </Link>
      </div>

      <form className="panel fade-up-delay" method="get">
        <div className="form-grid two">
          <div className="field">
            <label htmlFor="q">Buscar</label>
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Malbec, picanha, queijo..."
            />
          </div>
          <div className="field">
            <label htmlFor="type">Tipo</label>
            <select id="type" name="type" defaultValue={params.type ?? "ALL"}>
              <option value="ALL">Todos</option>
              {WINE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {WINE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pairingCategory">Harmonização</label>
            <select
              id="pairingCategory"
              name="pairingCategory"
              defaultValue={params.pairingCategory ?? "ALL"}
            >
              <option value="ALL">Todas</option>
              {PAIRING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {PAIRING_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">Ordenar</label>
            <select id="sort" name="sort" defaultValue={params.sort ?? "name"}>
              <option value="name">Nome</option>
              <option value="vintage">Safra</option>
              <option value="quantity">Quantidade</option>
            </select>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <label style={{ display: "inline-flex", gap: "0.45rem", alignItems: "center" }}>
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={params.inStock === "1"}
            />
            Somente em estoque
          </label>
          <button type="submit" className="btn btn-secondary btn-small">
            Filtrar
          </button>
          <Link href="/vinhos" className="btn btn-ghost btn-small">
            Limpar
          </Link>
        </div>
      </form>

      <section className="stack fade-up-delay-2">
        {wines.length === 0 ? (
          <div className="panel stack">
            <h2 className="display" style={{ margin: 0, fontSize: "1.8rem" }}>
              Sua adega está vazia
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Cadastre o primeiro vinho e associe uma sugestão gastronômica.
            </p>
            <div>
              <Link href="/vinhos/novo" className="btn btn-primary">
                Cadastrar vinho
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="muted" style={{ marginBottom: "0.25rem" }}>
              {wines.length} {wines.length === 1 ? "vinho" : "vinhos"}
            </p>
            {wines.map((wine) => (
              <Link key={wine.id} href={`/vinhos/${wine.id}`} className="wine-row">
                <div>
                  <strong className="display" style={{ fontSize: "1.35rem" }}>
                    {wine.name}
                  </strong>
                  <div className="muted">
                    {wine.producer}
                    {wine.vintage ? ` · ${wine.vintage}` : ""}
                    {wine.grape ? ` · ${wine.grape}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  <span className="tag">{WINE_TYPE_LABELS[wine.type]}</span>
                  <span className="tag">
                    {wine._count.pairings}{" "}
                    {wine._count.pairings === 1 ? "sugestão" : "sugestões"}
                  </span>
                </div>
                <div style={{ fontWeight: 700 }}>
                  {wine.quantity} {wine.quantity === 1 ? "garrafa" : "garrafas"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
