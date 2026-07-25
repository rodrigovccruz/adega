"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Não foi possível entrar");
        return;
      }

      router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/vinhos");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p
          role="alert"
          className="rounded-md bg-wine-700/10 border border-wine-700/30 text-wine-800 px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-wine-900 mb-1">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine-600"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-wine-900 mb-1">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-wine-700/30 bg-cream-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wine-600"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-wine-700 text-cream-100 rounded-md py-2.5 font-medium hover:bg-wine-600 transition-colors disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <p className="text-sm text-center text-wine-800/80">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-wine-700 font-medium hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
