"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { submitTransaction } from "@/lib/actions/finance-tx";
import { BUSINESS_CATEGORIES, PERSONAL_CATEGORIES, type TxScope } from "@/lib/data/finance";

const CURRENCIES = ["THB", "USD", "RUB"] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-panel px-4 py-3 text-base font-semibold text-panel-fg transition hover:bg-panel/90 disabled:opacity-50"
    >
      {pending ? "Сохраняю…" : "✅ Сохранить трату"}
    </button>
  );
}

export function AddTransactionForm({ defaultScope = "личное" }: { defaultScope?: TxScope }) {
  const [scope, setScope] = useState<TxScope>(defaultScope);
  const [category, setCategory] = useState("Прочее");
  const cats = scope === "бизнес" ? BUSINESS_CATEGORIES : PERSONAL_CATEGORIES;

  const inputCls =
    "w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2.5 outline-none focus:border-brass-500";

  return (
    <form action={submitTransaction} className="space-y-4">
      <input type="hidden" name="scope" value={scope} />

      {/* Сфера: личное / бизнес */}
      <div className="flex overflow-hidden rounded-full border border-forest-900/15 text-sm">
        {(["личное", "бизнес"] as TxScope[]).map((s) => {
          const on = scope === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                setScope(s);
                setCategory("Прочее");
              }}
              className={
                "flex-1 px-4 py-2.5 font-medium transition " +
                (on ? "bg-panel text-panel-fg" : "text-forest-900/60 hover:bg-forest-900/5")
              }
            >
              {s === "личное" ? "🏠 Личное" : "🏢 Бизнес"}
            </button>
          );
        })}
      </div>

      {/* Сумма + валюта */}
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-forest-900/50">Сумма</label>
        <div className="flex gap-2">
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            required
            autoFocus
            placeholder="800"
            className={inputCls + " text-2xl font-semibold tabular-nums text-forest-900"}
          />
          <select
            name="currency"
            defaultValue="THB"
            className="rounded-md border border-forest-900/15 bg-cream-50 px-3 text-base font-medium text-forest-900 outline-none focus:border-brass-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Категория (зависит от сферы) */}
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-forest-900/50">
          Категория
        </label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls + " text-forest-900"}
        >
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Заметка */}
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-forest-900/50">Заметка</label>
        <input name="note" type="text" placeholder="бензин для байка" className={inputCls + " text-forest-900"} />
        <p className="mt-1 text-xs text-forest-900/45">
          🎤 Нажми микрофон на клавиатуре телефона и надиктуй — поле заполнится текстом.
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}
