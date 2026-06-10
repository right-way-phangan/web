"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualLeadAction } from "@/lib/actions/lead-actions";

const CHANNELS = [
  { key: "", label: "— канал —" },
  { key: "telegram", label: "Telegram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "walk-in", label: "Лично / визит" },
  { key: "referral", label: "Рекомендация" },
  { key: "phone", label: "Звонок" },
  { key: "other", label: "Другое" },
] as const;

/** Manual lead intake — log a client met via an offline channel. */
export function NewLeadForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await createManualLeadAction(formData);
      if (res.ok && res.leadId) {
        router.push(`/admin/crm/${res.leadId}`);
      } else if (res.ok) {
        router.push("/admin/crm");
      } else {
        setError(res.error ?? "Не удалось создать лид.");
      }
    });
  }

  const field =
    "w-full rounded-md border border-forest-900/15 bg-white px-3 py-2 text-sm text-forest-900 outline-none focus:border-brass-500";
  const labelCls = "block text-xs font-medium text-forest-900/55";

  return (
    <form action={submit} className="max-w-xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1 sm:col-span-2">
          <span className={labelCls}>Имя контакта *</span>
          <input name="contactName" required autoFocus className={field} placeholder="Имя клиента" />
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Телефон</span>
          <input name="phone" className={field} placeholder="+66…" />
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Email</span>
          <input name="email" type="email" className={field} placeholder="—" />
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Воронка *</span>
          <select name="pipeline" defaultValue="land" className={field}>
            <option value="land">Land</option>
            <option value="villa_house">Villas &amp; Houses</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Канал</span>
          <select name="channel" defaultValue="" className={field}>
            {CHANNELS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className={labelCls}>Объект (RW, если интересует конкретный)</span>
          <input name="rwNumber" className={field} placeholder="RW-L0001 / RW-V0003…" />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className={labelCls}>Заметка</span>
          <textarea
            name="note"
            rows={3}
            className={field}
            placeholder="Что хочет, бюджет, договорённости…"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-forest-900 px-5 py-2 text-sm font-medium text-white hover:bg-forest-900/90 disabled:opacity-50"
        >
          {pending ? "Создаю…" : "Создать лид"}
        </button>
        <span className="text-xs text-forest-900/45">
          Попадёт в стадию Incoming выбранной воронки.
        </span>
      </div>
    </form>
  );
}
