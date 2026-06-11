"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualLeadAction } from "@/lib/actions/lead-actions";

const SOURCES = [
  { key: "walk-in", label: "Walk-in (зашёл в офис)" },
  { key: "ad", label: "Реклама (Meta / Google / …)" },
  { key: "telegram", label: "Telegram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "phone", label: "Звонок" },
  { key: "referral", label: "Рекомендация" },
  { key: "other", label: "Другое" },
] as const;

const INTEREST_TYPES = ["", "Land", "Villa", "House", "Apartment", "Project"] as const;

const TIMEFRAMES = [
  { key: "", label: "— срок —" },
  { key: "now", label: "Готов сейчас 🔥" },
  { key: "1-3m", label: "1–3 месяца" },
  { key: "3-6m", label: "3–6 месяцев" },
  { key: "browsing", label: "Присматривается" },
] as const;

/** Manual lead intake — walk-in, ad-driven, messenger or referral. */
export function NewLeadForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dup, setDup] = useState<{ id: number; contactName: string | null; stage: string | null } | null>(null);
  const [source, setSource] = useState<string>("walk-in");
  const [interestType, setInterestType] = useState<string>("");
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    setDup(null);
    start(async () => {
      const res = await createManualLeadAction(formData);
      if (res.ok && res.leadId) router.push(`/admin/crm/${res.leadId}`);
      else if (res.ok) router.push("/admin/crm");
      else if (res.duplicate) setDup(res.duplicate);
      else setError(res.error ?? "Не удалось создать лид.");
    });
  }

  const field =
    "w-full rounded-md border border-forest-900/15 bg-white px-3 py-2 text-sm text-forest-900 outline-none focus:border-brass-500";
  const labelCls = "block text-xs font-medium text-forest-900/55";
  const sectionCls = "rounded-xl border border-forest-900/10 bg-white/60 p-4";
  const sectionTitle = "mb-3 text-xs font-semibold uppercase tracking-wide text-forest-900/50";

  return (
    <form action={submit} className="max-w-2xl space-y-4">
      {/* Контакт */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Контакт</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className={labelCls}>Имя *</span>
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
        </div>
        <p className="mt-2 text-xs text-forest-900/45">
          Для walk-in достаточно имени — контакты можно дозаполнить позже на карточке.
        </p>
      </div>

      {/* Источник */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Источник</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelCls}>Откуда пришёл</span>
            <select
              name="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={field}
            >
              {SOURCES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          {source === "ad" && (
            <label className="space-y-1">
              <span className={labelCls}>Кампания / площадка</span>
              <input
                name="adCampaign"
                className={field}
                placeholder="Meta · lead-form · June-land"
              />
            </label>
          )}
        </div>
      </div>

      {/* Что ищет */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Что ищет (квалификация)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelCls}>Тип объекта</span>
            <select
              name="interestType"
              value={interestType}
              onChange={(e) => setInterestType(e.target.value)}
              className={field}
            >
              {INTEREST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t || "— тип —"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelCls}>Район</span>
            <input name="district" className={field} placeholder="Sri Thanu, Haad Salad…" />
          </label>
          <label className="space-y-1">
            <span className={labelCls}>Бюджет</span>
            <input name="budget" className={field} placeholder="8–12M THB" />
          </label>
          <label className="space-y-1">
            <span className={labelCls}>Срок покупки</span>
            <select name="timeframe" defaultValue="" className={field}>
              {TIMEFRAMES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className={labelCls}>Конкретный объект (RW), если есть</span>
            <input name="rwNumber" className={field} placeholder="RW-L0001 / RW-V0003…" />
          </label>
          {!interestType && (
            <label className="space-y-1">
              <span className={labelCls}>Воронка</span>
              <select name="pipeline" defaultValue="land" className={field}>
                <option value="land">Land</option>
                <option value="villa_house">Villas &amp; Houses</option>
              </select>
            </label>
          )}
        </div>
        {interestType && (
          <p className="mt-2 text-xs text-forest-900/45">
            Воронка определится автоматически по типу: {" "}
            {["Villa", "House", "Apartment", "Project"].includes(interestType)
              ? "Villas & Houses"
              : "Land"}
            .
          </p>
        )}
      </div>

      {/* Заметка */}
      <div className={sectionCls}>
        <p className={sectionTitle}>Заметка</p>
        <textarea
          name="note"
          rows={3}
          className={field}
          placeholder="Договорённости, детали разговора, что показать…"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      {dup && (
        <div className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
          ⚠️ Похоже, такой контакт уже есть:{" "}
          <a
            href={`/admin/crm/${dup.id}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline"
          >
            лид #{dup.id} {dup.contactName || ""}
          </a>
          {dup.stage ? ` (стадия ${dup.stage})` : ""}. Откройте его и добавьте заметку — или
          нажмите «Создать всё равно», если это действительно новый запрос.
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-forest-900 px-5 py-2 text-sm font-medium text-white hover:bg-forest-900/90 disabled:opacity-50"
        >
          {pending ? "Создаю…" : "Создать лид"}
        </button>
        {dup && (
          <button
            type="submit"
            name="force"
            value="1"
            disabled={pending}
            className="rounded-full border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-500/10 disabled:opacity-50"
          >
            Создать всё равно
          </button>
        )}
        <span className="text-xs text-forest-900/45">Попадёт в стадию Incoming.</span>
      </div>
    </form>
  );
}
