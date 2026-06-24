"use client";

import { useFormStatus } from "react-dom";
import { setWalletBalances } from "@/lib/actions/finance-tx";

type Cash = { thb: number; rub: number; usd: number };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-panel px-4 py-3 text-base font-semibold text-panel-fg transition hover:bg-panel/90 disabled:opacity-50"
    >
      {pending ? "Сохраняю…" : "Сохранить кассы"}
    </button>
  );
}

const inputCls =
  "w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2.5 text-lg font-semibold tabular-nums text-forest-900 outline-none focus:border-brass-500";

/** Три поля валют (฿/₽/$) одной кассы. */
function CashFields({ prefix, value }: { prefix: string; value: Cash }) {
  const fields: Array<[string, string, number]> = [
    ["Thb", "฿ баты", value.thb],
    ["Rub", "₽ рубли", value.rub],
    ["Usd", "$ доллары", value.usd],
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {fields.map(([suffix, label, v]) => (
        <div key={suffix}>
          <label className="mb-1 block text-[11px] text-forest-900/45">{label}</label>
          <input
            name={prefix + suffix}
            type="text"
            inputMode="numeric"
            defaultValue={String(v)}
            className={inputCls}
          />
        </div>
      ))}
    </div>
  );
}

export function WalletsForm({ personal, business }: { personal: Cash; business: Cash }) {
  return (
    <form action={setWalletBalances} className="space-y-5">
      <div>
        <p className="mb-1.5 text-sm font-medium text-forest-900">🏠 Личные деньги — наличка</p>
        <CashFields prefix="personal" value={personal} />
      </div>
      <div>
        <p className="mb-1.5 text-sm font-medium text-forest-900">
          🏢 Right Way — наличные компании
        </p>
        <CashFields prefix="business" value={business} />
        <p className="mt-1 text-xs text-forest-900/45">
          Пока счёта компании нет — оставь нули. Бизнес-траты сделают баланс отрицательным = «компания
          должна тебе».
        </p>
      </div>
      <SubmitButton />
      <p className="text-xs text-forest-900/45">
        Вводишь сколько <strong>реально</strong> держишь в каждой валюте. Общий остаток считается в ฿ по
        живому курсу. 🏠 Личные вычитают <strong>все</strong> траты (вкл. бизнес с личной карты).
        Сохранение ставит дату «сегодня» — дальше траты уменьшают остаток сами.
      </p>
    </form>
  );
}
