import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container stack" style={{ paddingBlock: "4rem", maxWidth: "560px" }}>
      <h1 className="display" style={{ margin: 0, fontSize: "2.6rem" }}>
        Página não encontrada
      </h1>
      <p className="muted" style={{ margin: 0 }}>
        Esse caminho não existe na Adega.
      </p>
      <div>
        <Link href="/" className="btn btn-primary">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
