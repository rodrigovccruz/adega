import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { quantityAdjustSchema } from "@/lib/validation/wine";
import { adjustWineQuantity } from "@/lib/wines/service";
import { AppError } from "@/lib/errors";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = quantityAdjustSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const wine = await adjustWineQuantity(user.id, id, parsed.data);
    return NextResponse.json({ wine });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
