"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "@/actions/auth";

type Props = {
  mode: "login" | "register";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="stack-lg panel fade-up">
      <div className="stack">
        <p className="eyebrow">{isRegister ? "Comece agora" : "Bem-vindo de volta"}</p>
        <h1 className="display" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", margin: 0 }}>
          {isRegister ? "Criar conta" : "Entrar na Adega"}
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          {isRegister
            ? "Guarde seus vinhos e as harmonizações que importam."
            : "Acesse sua coleção privada."}
        </p>
      </div>

      {state.error ? <div className="alert">{state.error}</div> : null}

      <div className="form-grid">
        {isRegister ? (
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input id="name" name="name" required autoComplete="name" />
            {state.fieldErrors?.name ? (
              <span className="error">{state.fieldErrors.name[0]}</span>
            ) : null}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          {state.fieldErrors?.email ? (
            <span className="error">{state.fieldErrors.email[0]}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isRegister ? 8 : 1}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
          {state.fieldErrors?.password ? (
            <span className="error">{state.fieldErrors.password[0]}</span>
          ) : null}
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
      </button>

      <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
        {isRegister ? (
          <>
            Já tem conta? <Link href="/login">Entrar</Link>
          </>
        ) : (
          <>
            Novo por aqui? <Link href="/cadastro">Criar conta</Link>
          </>
        )}
      </p>
    </form>
  );
}
