import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listWines } from "@/lib/wines/service";
import { wineListQuerySchema, wineTypes, wineTypeLabels } from "@/lib/validation/wine";

export const metadata = {
  title: "Minha adega",
};

type SearchParams = {
  q?: string;
  type?: string;
  inStock?: string;
  sort?: string;
  order?: string;
};

export default async function VinhosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireCurrentUser();
  const rawParams = await searchParams;

  const parsedQuery = wineListQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success ? parsedQuery.data : wineListQuerySchema.parse({});

  const wines = await listWines(user.id, query);
  const hasFilters = Boolean(query.q || query.type || query.inStock);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-display text-3xl text-wine-900">Minha adega</h1>
        <Link
          href="/vinhos/novo"
          className="bg-wine-700 text-cream-100 px-4 py-2 rounded-md font-medium hover:bg-wine-600 transition-colors"
        >
          + Cadastrar vinho
        </Link>
      </div>

      <form
        method="GET"
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-cream-200 rounded-lg p-4 border border-wine-700/15"
      >
        <div className="lg:col-span-2">
          <label htmlFor="q" className="block text-sm font-medium text-wine-900 mb-1">
            Buscar por vinho ou prato
          </label>
          <input
            id="q"
            name="q"
            defaultValue={rawParams.q ?? ""}
            placeholder="Ex.: malbec, picanha, queijo…"
            className="w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine-600"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-wine-900 mb-1">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            defaultValue={rawParams.type ?? ""}
            className="w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine-600"
          >
            <option value="">Todos</option>
            {wineTypes.map((type) => (
              <option key={type} value={type}>
                {wineTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-wine-900 mb-1">
            Ordenar por
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={query.sort}
            className="w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine-600"
          >
            <option value="name">Nome</option>
            <option value="vintage">Safra</option>
            <option value="quantity">Quantidade</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-wine-900">
            <input
              type="checkbox"
              name="inStock"
              value="true"
              defaultChecked={rawParams.inStock === "true"}
              className="rounded border-wine-700/40"
            />
            Somente em estoque
          </label>
        </div>

        <div className="sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="bg-wine-800 text-cream-100 px-5 py-2 rounded-md font-medium hover:bg-wine-700 transition-colors"
          >
            Buscar
          </button>
          {hasFilters && (
            <Link href="/vinhos" className="ml-4 text-sm text-wine-800 hover:underline">
              Limpar filtros
            </Link>
          )}
        </div>
      </form>

      {wines.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-wine-700/30 rounded-lg">
          <p className="text-wine-800/80 text-lg">
            {hasFilters
              ? "Nenhum vinho encontrado com esses filtros."
              : "Sua adega está vazia. Cadastre o primeiro vinho para começar."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wines.map((wine) => (
            <li key={wine.id}>
              <Link
                href={`/vinhos/${wine.id}`}
                className="block h-full bg-cream-200 hover:bg-cream-300 transition-colors rounded-lg p-4 border border-wine-700/15"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-display text-xl text-wine-900">{wine.name}</h2>
                  <span className="text-xs font-medium bg-wine-800 text-cream-100 px-2 py-1 rounded-full whitespace-nowrap">
                    {wineTypeLabels[wine.type]}
                  </span>
                </div>
                <p className="text-sm text-wine-800/80">{wine.producer}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-wine-800/70">
                  <span>{wine.vintage ?? "—"}</span>
                  <span>
                    {wine.quantity} garrafa{wine.quantity === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gold-500 font-medium">
                  {wine._count.pairings} harmonização
                  {wine._count.pairings === 1 ? "" : "ões"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
