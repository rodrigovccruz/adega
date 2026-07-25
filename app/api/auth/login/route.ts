import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { authenticateUser } from "@/lib/auth/service";
import { createSession } from "@/lib/auth/session";
import { isRateLimited } from "@/lib/auth/rate-limit";
import { AppError } from "@/lib/errors";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (isRateLimited(parsed.data.email)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429 },
    );
  }

  try {
    const user = await authenticateUser(parsed.data);
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
