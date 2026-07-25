"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/auth";

type Props = {
  quantity: number;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export function QuantityForm({ quantity, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="panel stack">
      <h2 className="display" style={{ fontSize: "1.4rem", margin: 0 }}>
        Estoque
      </h2>
      {state.error ? <div className="alert">{state.error}</div> : null}
      <div className="field">
        <label htmlFor="quantity">Garrafas</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          required
          defaultValue={quantity}
        />
      </div>
      <button type="submit" className="btn btn-secondary btn-small" disabled={pending}>
        {pending ? "Atualizando..." : "Atualizar quantidade"}
      </button>
    </form>
  );
}
