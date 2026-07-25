import Link from "next/link";
import { logoutAction } from "@/actions/auth";

type Props = {
  userName?: string | null;
};

export function SiteHeader({ userName }: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(10px)",
        background: "rgba(232, 226, 218, 0.78)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          minHeight: "4rem",
        }}
      >
        <Link href={userName ? "/vinhos" : "/"} className="display" style={{ fontSize: "1.55rem" }}>
          Adega
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {userName ? (
            <>
              <span className="muted" style={{ fontSize: "0.92rem" }}>
                Olá, {userName.split(" ")[0]}
              </span>
              <Link href="/vinhos" className="btn btn-secondary btn-small">
                Minha adega
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-ghost btn-small">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-small">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn btn-primary btn-small">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
