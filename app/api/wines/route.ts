import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { wineSchema, wineListQuerySchema } from "@/lib/validation/wine";
import { listWines, createWine } from "@/lib/wines/service";
import { AppError } from "@/lib/errors";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = wineListQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    inStock: searchParams.get("inStock") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    order: searchParams.get("order") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Parâmetros de busca inválidos" }, { status: 400 });
  }

  const wines = await listWines(user.id, parsedQuery.data);
  return NextResponse.json({ wines });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = wineSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const wine = await createWine(user.id, parsed.data);
    return NextResponse.json({ wine }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
