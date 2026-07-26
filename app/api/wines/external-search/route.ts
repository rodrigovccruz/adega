import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { searchExternalWines } from "@/lib/external-wine/service";
import { AppError } from "@/lib/errors";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    const results = await searchExternalWines(query);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
