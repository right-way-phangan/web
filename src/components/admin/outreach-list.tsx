"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Phone, PhoneOff, Archive, FileSignature, CheckCircle2, Search } from "lucide-react";
import {
  recordCallOutcome,
  saveOwnerContact,
  type OutreachOutcome,
} from "@/lib/actions/outreach";

/** Row prepared by /admin/outreach (unsanitized objects, internal-only). */
export interface OutreachRow {
  rwNumber: string;
  titleEn: string;
  district?: string;
  areaLabel: string;
  priceLabel: string;
  ownerName?: string;
  onSite: boolean;
  missing: string[]; // чего не хватает в карточке (район/фото/цена…)
  outreachStatus?: string;
  outreachNote?: string;
  outreachDate?: string;
  outreachAttempts?: number;
}

const FILTERS = [
  { key: "todo", label: "Звонить" },
  { key: "no_answer", label: "Недозвон" },
  { key: "confirmed", label: "Подтверждён" },
  { key: "leasehold_ok", label: "Leasehold" },
  { key: "archived", label: "Архив" },
  { key: "all", label: "Все" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function bucket(r: OutreachRow): FilterKey {
  switch (r.outreachStatus) {
    case "confirmed":
      return "confirmed";
    case "leasehold_ok":
      return "leasehold_ok";
    case "archived":
      return "archived";
    case "no_answer":
      return "no_answer";
    default:
      return "todo";
  }
}

export function OutreachList({ rows }: { rows: OutreachRow[] }) {
  const [filter, setFilter] = useState<FilterKey>("todo");
  const [busyRw, setBusyRw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // локальные правки до сохранения
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Record<string, string>>({});
  const [, start] = useTransition();

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      todo: 0, no_answer: 0, confirmed: 0, leasehold_ok: 0, archived: 0, all: rows.length,
    };
    for (const r of rows) c[bucket(r)]++;
    return c;
  }, [rows]);

  const visible = filter === "all" ? rows : rows.filter((r) => bucket(r) === filter);

  function outcome(r: OutreachRow, o: OutreachOutcome) {
    setBusyRw(r.rwNumber);
    setError(null);
    start(async () => {
      const res = await recordCallOutcome(r.rwNumber, o, {
        note: notes[r.rwNumber],
        prevNote: r.outreachNote,
        prevAttempts: r.outreachAttempts,
      });
      if (!res.ok) setError(res.error ?? "Не удалось сохранить");
      else setNotes((n) => ({ ...n, [r.rwNumber]: "" }));
      setBusyRw(null);
    });
  }

  function saveContact(r: OutreachRow) {
    const v = contacts[r.rwNumber];
    if (v == null || v === (r.ownerName ?? "")) return;
    start(async () => {
      const res = await saveOwnerContact(r.rwNumber, v);
      if (!res.ok) setError(res.error ?? "Не удалось сохранить контакт");
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-medium transition " +
              (filter === f.key
                ? "bg-forest-900 text-cream-50"
                : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/10")
            }
          >
            {f.label} · {counts[f.key]}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <ul className="space-y-3">
        {visible.map((r) => {
          const busy = busyRw === r.rwNumber;
          const contact = contacts[r.rwNumber] ?? r.ownerName ?? "";
          return (
            <li
              key={r.rwNumber}
              className="rounded-sm border border-forest-900/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  href={`/object/${r.rwNumber}` as Route}
                  target="_blank"
                  className="font-semibold text-forest-900 hover:text-brass-500"
                >
                  {r.rwNumber}
                </Link>
                <span className="text-sm text-forest-500">
                  {r.district ?? "район?"} · {r.areaLabel} · {r.priceLabel}
                </span>
                {r.onSite ? <span title="Опубликован на сайте">🌐</span> : null}
                {(r.outreachAttempts ?? 0) > 0 ? (
                  <span className="text-xs text-forest-500/70">
                    недозвонов: {r.outreachAttempts}
                  </span>
                ) : null}
                {r.outreachDate ? (
                  <span className="text-xs text-forest-500/70">посл. касание {r.outreachDate}</span>
                ) : null}
              </div>

              <p className="mt-0.5 truncate text-sm text-forest-500/80" title={r.titleEn}>
                {r.titleEn}
              </p>

              {r.missing.length > 0 ? (
                <p className="mt-1 text-xs font-medium text-red-700">
                  Уточнить в звонке: {r.missing.join(", ")}
                </p>
              ) : null}

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-1.5">
                  <input
                    value={contact}
                    onChange={(e) =>
                      setContacts((c) => ({ ...c, [r.rwNumber]: e.target.value }))
                    }
                    onBlur={() => saveContact(r)}
                    placeholder="Собственник · телефон"
                    className="min-h-[44px] w-full rounded-sm border border-forest-900/15 px-3 py-2 text-sm text-forest-900"
                  />
                  <Link
                    href={"/admin/crm/contacts" as Route}
                    target="_blank"
                    title="Искать в книге контактов"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-forest-900/15 text-forest-500 hover:text-forest-900"
                  >
                    <Search className="h-4 w-4" />
                  </Link>
                </div>
                <input
                  value={notes[r.rwNumber] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [r.rwNumber]: e.target.value }))}
                  placeholder="Заметка к итогу (цена, условия…)"
                  className="min-h-[44px] flex-1 rounded-sm border border-forest-900/15 px-3 py-2 text-sm text-forest-900"
                />
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <OutcomeButton
                  icon={CheckCircle2}
                  label="Подтверждён"
                  disabled={busy}
                  onClick={() => outcome(r, "confirmed")}
                  className="bg-brass-500/15 text-forest-900 hover:bg-brass-500/30"
                />
                <OutcomeButton
                  icon={FileSignature}
                  label="Leasehold OK"
                  disabled={busy}
                  onClick={() => outcome(r, "leasehold_ok")}
                  className="bg-forest-900/10 text-forest-900 hover:bg-forest-900/15"
                />
                <OutcomeButton
                  icon={PhoneOff}
                  label="Недозвон"
                  disabled={busy}
                  onClick={() => outcome(r, "no_answer")}
                  className="bg-forest-900/5 text-forest-900 hover:bg-forest-900/10"
                />
                <OutcomeButton
                  icon={Archive}
                  label="В архив"
                  disabled={busy}
                  onClick={() => outcome(r, "archived")}
                  className="bg-red-50 text-red-700 hover:bg-red-100"
                />
              </div>

              {r.outreachNote ? (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-forest-500/80">
                    История касаний
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap text-xs text-forest-500">
                    {r.outreachNote}
                  </pre>
                </details>
              ) : null}
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="rounded-sm border border-forest-900/10 bg-white p-8 text-center text-forest-500/70">
            Пусто.
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function OutcomeButton({
  icon: Icon,
  label,
  disabled,
  onClick,
  className,
}: {
  icon: typeof Phone;
  label: string;
  disabled: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={
        "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium transition disabled:opacity-40 " +
        className
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
