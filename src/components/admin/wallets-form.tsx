"use client";

import { useFormStatus } from "react-dom";
import { setWalletBalances } from "@/lib/actions/finance-tx";

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

export function WalletsForm({
  defaultPersonal,
  defaultBusiness,
}: {
  defaultPersonal: number;
  defaultBusiness: number;
}) {
  const inputCls =
    "w-full rounded-md border border-forest-900/15 bg-cream-50 px-3 py-2.5 text-xl font-semibold tabular-nums text-forest-900 outline-none focus:border-brass-500";

  return (
    <form action={setWalletBalances} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-forest-900/50">
          🏠 Личные деньги (на руках), ฿
        </label>
        <input
          name="personal"
          type="text"
          inputMode="numeric"
          defaultValue={String(defaultPersonal)}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-forest-900/50">
          🏢 Деньги Right Way, ฿
        </label>
        <input
          name="business"
          type="text"
          inputMode="numeric"
          defaultValue={String(defaultBusiness)}
          className={inputCls}
        />
      </div>
      <SubmitButton />
      <p className="text-xs text-forest-900/45">
        Сохранение ставит дату «сегодня». Дальше траты дневника после этой даты уменьшают остаток
        автоматически — на дашборде видно «было → сейчас».
      </p>
    </form>
  );
}
