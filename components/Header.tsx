import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "@/components/LogoutButton";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-wine-950 text-cream-100 border-b border-wine-800">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-wide text-gold-400">
          Adega
        </Link>

        <nav className="flex items-center gap-5">
          {user ? (
            <>
              <Link
                href="/vinhos"
                className="text-sm font-medium hover:text-gold-400 transition-colors"
              >
                Minha adega
              </Link>
              <span className="hidden sm:inline text-sm text-cream-100/70">
                {user.name}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium hover:text-gold-400 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="text-sm font-medium bg-gold-500 text-wine-950 px-3 py-1.5 rounded-md hover:bg-gold-400 transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
