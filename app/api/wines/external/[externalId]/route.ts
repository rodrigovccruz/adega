import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getExternalWineDetail } from "@/lib/external-wine/service";
import { AppError } from "@/lib/errors";

type RouteParams = { params: Promise<{ externalId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { externalId } = await params;
  const id = Number(externalId);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }

  try {
    const wine = await getExternalWineDetail(id);
    return NextResponse.json({ wine });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
