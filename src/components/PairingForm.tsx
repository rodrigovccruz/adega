"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/actions/auth";
import {
  PAIRING_CATEGORIES,
  PAIRING_CATEGORY_LABELS,
  PAIRING_INTENSITIES,
  PAIRING_INTENSITY_LABELS,
} from "@/lib/labels";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export function PairingForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="stack panel">
      <h2 className="display" style={{ fontSize: "1.6rem", margin: 0 }}>
        Nova sugestão gastronômica
      </h2>

      {state.error ? <div className="alert">{state.error}</div> : null}

      <div className="form-grid two">
        <div className="field">
          <label htmlFor="title">Título *</label>
          <input
            id="title"
            name="title"
            required
            placeholder="Ex.: Picanha na brasa"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Categoria *</label>
          <select id="category" name="category" required defaultValue="CARNE">
            {PAIRING_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {PAIRING_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="intensity">Intensidade</label>
          <select id="intensity" name="intensity" defaultValue="">
            <option value="">—</option>
            {PAIRING_INTENSITIES.map((intensity) => (
              <option key={intensity} value={intensity}>
                {PAIRING_INTENSITY_LABELS[intensity]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Por que combina</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Taninos firmes equilibram a gordura da carne..."
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Adicionando..." : "Adicionar sugestão"}
      </button>
    </form>
  );
}
