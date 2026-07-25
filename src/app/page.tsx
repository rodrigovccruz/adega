import Link from "next/link";
import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getOptionalUser();
  if (user) {
    redirect("/vinhos");
  }

  return (
    <section
      style={{
        position: "relative",
        minHeight: "calc(100vh - 4rem)",
        overflow: "hidden",
        color: "#f7f1ea",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/hero-adega.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="hero-media"
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(26,20,18,0.88) 0%, rgba(26,20,18,0.62) 48%, rgba(26,20,18,0.28) 100%)",
        }}
      />

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 4rem)",
          display: "grid",
          alignContent: "center",
          gap: "1.25rem",
          paddingBlock: "4rem",
          maxWidth: "720px",
        }}
      >
        <p className="eyebrow fade-up" style={{ color: "rgba(247,241,234,0.75)" }}>
          Coleção pessoal
        </p>
        <h1
          className="display fade-up"
          style={{
            margin: 0,
            fontSize: "clamp(3.4rem, 9vw, 6.4rem)",
            color: "#f7f1ea",
          }}
        >
          Adega
        </h1>
        <p
          className="fade-up-delay"
          style={{
            margin: 0,
            fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
            maxWidth: "34ch",
            color: "rgba(247,241,234,0.9)",
            lineHeight: 1.5,
          }}
        >
          Controle seus vinhos e associe cada rótulo às sugestões gastronômicas
          certas para a mesa.
        </p>
        <div
          className="fade-up-delay-2"
          style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.5rem" }}
        >
          <Link href="/cadastro" className="btn btn-primary">
            Começar minha adega
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost"
            style={{ color: "#f7f1ea", borderColor: "rgba(247,241,234,0.55)" }}
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  );
}
