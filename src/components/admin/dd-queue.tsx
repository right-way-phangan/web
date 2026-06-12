"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronDown,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { setDdStatus, saveDdChecklist } from "@/lib/actions/dd-status";
import { DD_STATUSES, DD_CHECKLIST, type DdStatus, isVetted } from "@/lib/dd";

/** Row shape prepared by the /admin/dd server page (unsanitized objects). */
export interface DdRow {
  rwNumber: string;
  titleEn: string;
  type: string;
  status: string; // site status (Active/…)
  district?: string;
  onSite: boolean; // visible publicly (Active + cover photo)
  ddStatus?: string;
  ddDate?: string;
  ddLawyer?: string;
  ddChecklist?: Record<string, boolean>;
  /** Авто-факты из данных карточки — что уже есть/чего не хватает для L1. */
  facts: { label: string; ok: boolean }[];
}

const TABS = [
  { key: "queue", label: "Очередь (без вердикта)" },
  { key: "vetted", label: "Vetted" },
  { key: "red", label: "Red flag" },
  { key: "all", label: "Все" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function rowBucket(r: DdRow): TabKey {
  if (r.ddStatus === "Red flag") return "red";
  if (isVetted(r.ddStatus)) return "vetted";
  return "queue";
}

export function DdQueue({ rows, defaultLawyer }: { rows: DdRow[]; defaultLawyer: string }) {
  const [tab, setTab] = useState<TabKey>("queue");
  const [lawyer, setLawyer] = useState(defaultLawyer);
  const [openRw, setOpenRw] = useState<string | null>(null);
  const [busyRw, setBusyRw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Локальная копия тиков: мгновенный отклик чекбоксов, сохранение в фоне.
  const [ticks, setTicks] = useState<Record<string, Record<string, boolean>>>({});
  const [, start] = useTransition();

  const counts = useMemo(() => {
    const c = { queue: 0, vetted: 0, red: 0, all: rows.length };
    for (const r of rows) c[rowBucket(r)]++;
    return c;
  }, [rows]);

  const visible = tab === "all" ? rows : rows.filter((r) => rowBucket(r) === tab);

  function checklistOf(r: DdRow): Record<string, boolean> {
    return ticks[r.rwNumber] ?? r.ddChecklist ?? {};
  }

  function applyStatus(rw: string, status: DdStatus | "") {
    setBusyRw(rw);
    setError(null);
    start(async () => {
      const res = await setDdStatus(rw, status, lawyer);
      if (!res.ok) setError(res.error ?? "Не удалось сохранить");
      setBusyRw(null);
    });
  }

  function toggleTick(r: DdRow, key: string) {
    const next = { ...checklistOf(r), [key]: !checklistOf(r)[key] };
    setTicks((t) => ({ ...t, [r.rwNumber]: next }));
    setError(null);
    start(async () => {
      const res = await saveDdChecklist(r.rwNumber, next);
      if (!res.ok) {
        setError(res.error ?? "Не удалось сохранить чек-лист");
        // откат локального тика при ошибке
        setTicks((t) => ({ ...t, [r.rwNumber]: checklistOf(r) }));
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-medium transition " +
              (tab === t.key
                ? "bg-forest-900 text-cream-50"
                : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/10")
            }
          >
            {t.label} · {counts[t.key]}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-forest-500">
          Юрист:
          <input
            value={lawyer}
            onChange={(e) => setLawyer(e.target.value)}
            placeholder="Anas"
            className="w-28 rounded-sm border border-forest-900/15 bg-white px-2 py-1 text-sm text-forest-900"
          />
        </label>
      </div>

      {error ? (
        <p className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-sm border border-forest-900/10">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-forest-900/5 text-left text-forest-500">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="px-3 py-2 font-medium">RW</th>
              <th className="px-3 py-2 font-medium">Объект</th>
              <th className="px-3 py-2 font-medium">Район</th>
              <th className="px-3 py-2 text-center font-medium">Сайт</th>
              <th className="px-3 py-2 text-center font-medium">L1</th>
              <th className="px-3 py-2 font-medium">DD</th>
              <th className="px-3 py-2 font-medium">Вердикт</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const cl = checklistOf(r);
              const done = DD_CHECKLIST.filter((i) => cl[i.key]).length;
              const open = openRw === r.rwNumber;
              return [
                <tr key={r.rwNumber} className="border-t border-forest-900/10">
                  <td className="px-2 py-2">
                    <button
                      onClick={() => setOpenRw(open ? null : r.rwNumber)}
                      className="rounded-sm p-1 text-forest-500 hover:bg-forest-900/5 hover:text-forest-900"
                      aria-label={open ? "Свернуть" : "Развернуть чек-лист"}
                    >
                      {open ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-medium text-forest-900">
                    <Link
                      href={`/object/${r.rwNumber}` as Route}
                      target="_blank"
                      className="hover:text-brass-500"
                    >
                      {r.rwNumber}
                    </Link>
                  </td>
                  <td className="max-w-[260px] truncate px-3 py-2" title={r.titleEn}>
                    {r.titleEn}
                  </td>
                  <td className="px-3 py-2">{r.district ?? "—"}</td>
                  <td className="px-3 py-2 text-center">{r.onSite ? "🌐" : "—"}</td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    <span className={done === DD_CHECKLIST.length ? "font-semibold text-forest-900" : "text-forest-500/80"}>
                      {done}/{DD_CHECKLIST.length}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <DdState status={r.ddStatus} date={r.ddDate} lawyer={r.ddLawyer} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {DD_STATUSES.map((s) => (
                        <button
                          key={s}
                          disabled={busyRw === r.rwNumber || r.ddStatus === s}
                          onClick={() => applyStatus(r.rwNumber, s)}
                          className={
                            "rounded-sm px-2 py-1 text-xs font-medium transition disabled:opacity-40 " +
                            (s === "Red flag"
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : s === "Pending"
                                ? "bg-forest-900/5 text-forest-900 hover:bg-forest-900/10"
                                : "bg-brass-500/15 text-forest-900 hover:bg-brass-500/30")
                          }
                        >
                          {s}
                        </button>
                      ))}
                      {r.ddStatus ? (
                        <button
                          disabled={busyRw === r.rwNumber}
                          onClick={() => applyStatus(r.rwNumber, "")}
                          className="rounded-sm px-2 py-1 text-xs font-medium text-forest-500/70 hover:text-forest-900"
                          title="Сбросить вердикт"
                        >
                          ✕
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>,
                open ? (
                  <tr key={`${r.rwNumber}-details`} className="border-t border-forest-900/5 bg-cream-100/40">
                    <td />
                    <td colSpan={7} className="px-3 py-4">
                      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-forest-500">
                            Чек-лист L1 — Listing Vetting
                          </p>
                          <ul className="space-y-1.5">
                            {DD_CHECKLIST.map((item) => (
                              <li key={item.key}>
                                <label className="flex cursor-pointer items-start gap-2 text-sm text-forest-900">
                                  <input
                                    type="checkbox"
                                    checked={!!cl[item.key]}
                                    onChange={() => toggleTick(r, item.key)}
                                    className="mt-0.5 h-4 w-4 accent-forest-900"
                                  />
                                  <span>
                                    <span className="font-medium">{item.key}</span> · {item.label}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-forest-500">
                            Факты из карточки (авто)
                          </p>
                          <ul className="space-y-1.5">
                            {r.facts.map((f) => (
                              <li
                                key={f.label}
                                className="flex items-center gap-2 text-sm"
                              >
                                {f.ok ? (
                                  <Check className="h-4 w-4 shrink-0 text-forest-500" />
                                ) : (
                                  <X className="h-4 w-4 shrink-0 text-red-600" />
                                )}
                                <span className={f.ok ? "text-forest-900" : "font-medium text-red-700"}>
                                  {f.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-xs leading-relaxed text-forest-500/80">
                            Факты — подсказка, что уже есть в карточке. Тикать
                            пункты V1–V7 — только после реальной проверки.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null,
              ];
            })}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-forest-500/70">
                  Пусто.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DdState({
  status,
  date,
  lawyer,
}: {
  status?: string;
  date?: string;
  lawyer?: string;
}) {
  if (!status || status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1 text-forest-500/70">
        <Clock className="h-3.5 w-3.5" /> {status ?? "—"}
      </span>
    );
  }
  if (status === "Red flag") {
    return (
      <span
        className="inline-flex items-center gap-1 font-medium text-red-700"
        title={lawyer ? `Юрист: ${lawyer}` : undefined}
      >
        <ShieldAlert className="h-3.5 w-3.5" /> Red flag{date ? ` · ${date}` : ""}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 font-medium text-forest-900"
      title={lawyer ? `Юрист: ${lawyer}` : undefined}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-brass-500" /> {status}
      {date ? ` · ${date}` : ""}
    </span>
  );
}
