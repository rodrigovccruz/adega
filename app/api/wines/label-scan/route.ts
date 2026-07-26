import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { scanWineLabel } from "@/lib/wines/label-scan-service";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("photo");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Envie uma foto do rótulo" }, { status: 400 });
  }

  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato de imagem não suportado. Use JPEG, PNG ou WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máximo 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await scanWineLabel(buffer, file.type);

  return NextResponse.json(result);
}
