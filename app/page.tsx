import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/vinhos");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl text-wine-900 mb-4">Adega</h1>
      <p className="text-lg text-wine-800/80 max-w-xl mx-auto mb-10">
        Controle pessoal de vinhos: cadastre sua coleção, saiba o que ainda tem
        na prateleira e associe cada rótulo a uma harmonização gastronômica.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/cadastro"
          className="bg-wine-700 text-cream-100 px-6 py-3 rounded-md font-medium hover:bg-wine-600 transition-colors"
        >
          Criar minha adega
        </Link>
        <Link
          href="/login"
          className="border border-wine-700 text-wine-800 px-6 py-3 rounded-md font-medium hover:bg-wine-950/5 transition-colors"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
