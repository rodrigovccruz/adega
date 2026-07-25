"use client";

import { useActionState } from "react";
import type { Wine } from "@prisma/client";
import type { ActionState } from "@/actions/auth";
import { WINE_TYPE_LABELS, WINE_TYPES } from "@/lib/labels";

type Props = {
  wine?: Wine;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
};

const initialState: ActionState = {};

export function WineForm({ wine, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="stack-lg panel">
      {state.error ? <div className="alert">{state.error}</div> : null}

      <div className="form-grid two">
        <div className="field">
          <label htmlFor="name">Nome *</label>
          <input id="name" name="name" required defaultValue={wine?.name ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="producer">Produtor *</label>
          <input
            id="producer"
            name="producer"
            required
            defaultValue={wine?.producer ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="type">Tipo *</label>
          <select id="type" name="type" required defaultValue={wine?.type ?? "TINTO"}>
            {WINE_TYPES.map((type) => (
              <option key={type} value={type}>
                {WINE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="quantity">Quantidade *</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={0}
            required
            defaultValue={wine?.quantity ?? 1}
          />
        </div>
        <div className="field">
          <label htmlFor="grape">Uva</label>
          <input id="grape" name="grape" defaultValue={wine?.grape ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="vintage">Safra</label>
          <input
            id="vintage"
            name="vintage"
            type="number"
            min={1900}
            max={2100}
            defaultValue={wine?.vintage ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="country">País</label>
          <input id="country" name="country" defaultValue={wine?.country ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="region">Região</label>
          <input id="region" name="region" defaultValue={wine?.region ?? ""} />
        </div>
        <div className="field">
          <label htmlFor="alcoholPct">Teor alcoólico (%)</label>
          <input
            id="alcoholPct"
            name="alcoholPct"
            type="number"
            step="0.1"
            min={0}
            max={100}
            defaultValue={wine?.alcoholPct ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="purchasePrice">Preço de compra</label>
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            min={0}
            defaultValue={wine?.purchasePrice ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="location">Localização na adega</label>
          <input
            id="location"
            name="location"
            defaultValue={wine?.location ?? ""}
            placeholder="Ex.: Prateleira A3"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="notes">Notas</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={wine?.notes ?? ""}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
