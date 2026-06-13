"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ObjectEditButton } from "@/components/admin/object-edit";
import { bulkUpdateObjectStatus } from "@/lib/actions/bulk-objects";

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-700",
  Reserved: "bg-amber-500/10 text-amber-700",
  Hold: "bg-amber-500/10 text-amber-700",
  Sold: "bg-forest-900/10 text-forest-900/60",
  Withdrawn: "bg-forest-900/5 text-forest-900/40",
};

const BULK_STATUSES = ["Active", "Reserved", "Hold", "Sold", "Withdrawn"] as const;

/** Serialized object row the client table renders + edits. */
export interface AdminObjectRow {
  rwNumber: string;
  type: string;
  status: string;
  titleEn?: string | null;
  district?: string | null;
  priceText: string;
  areaText: string;
  photos: number;
  isPublic: boolean;
  isUnit: boolean;
  leadCount: number;
  /** First-party views (object_views_daily): last 7 / last 30 days. */
  views7: number;
  views30: number;
  // edit-modal fields
  priceThb?: number | null;
  pricePerRai?: number | null;
  rentPerRaiMonth?: number | null;
  leaseTermYears?: number | null;
  unitsAvailable?: number | null;
  locationUrl?: string | null;
}

export function ObjectsTable({
  rows,
  headerCells,
}: {
  rows: AdminObjectRow[];
  headerCells: ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.rwNumber));

  function toggle(rw: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rw)) next.delete(rw);
      else next.add(rw);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allOnPage ? new Set() : new Set(rows.map((r) => r.rwNumber)));
  }

  function applyBulk(status: string) {
    const rws = [...selected];
    if (rws.length === 0) return;
    setMsg(null);
    start(async () => {
      const res = await bulkUpdateObjectStatus(rws, status);
      setSelected(new Set());
      setMsg(
        res.failed === 0
          ? `Обновлено ${res.updated} → ${status}.`
          : `Обновлено ${res.updated}, ошибок ${res.failed}.`,
      );
      router.refresh();
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-brass-500/30 bg-brass-500/[0.07] px-4 py-2.5">
          <span className="text-sm font-medium text-forest-900">
            Выбрано: {selected.size}
          </span>
          <span className="text-xs text-forest-900/50">Сменить статус на:</span>
          {BULK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => applyBulk(s)}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-forest-900/80 ring-1 ring-forest-900/10 hover:bg-forest-900 hover:text-white disabled:opacity-50"
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-forest-900/50 hover:text-forest-900"
          >
            Снять выделение
          </button>
        </div>
      )}
      {msg && (
        <p className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">{msg}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-forest-900/10">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 bg-forest-900/[0.03] text-left text-xs uppercase tracking-wide text-forest-900/50">
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={allOnPage}
                  onChange={toggleAll}
                  aria-label="Выделить все на странице"
                  className="h-3.5 w-3.5 accent-brass-600"
                />
              </th>
              {headerCells}
              <th className="px-3 py-2 text-center font-medium">Лиды</th>
              <th className="px-3 py-2 text-center font-medium">Правка</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-sm text-forest-900/40">
                  Ничего не найдено.
                </td>
              </tr>
            ) : (
              rows.map((o) => {
                const checked = selected.has(o.rwNumber);
                return (
                  <tr
                    key={o.rwNumber}
                    className={
                      "border-b border-forest-900/5 hover:bg-brass-500/[0.04] " +
                      (checked ? "bg-brass-500/[0.06] " : o.isUnit ? "bg-forest-900/[0.015] " : "")
                    }
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(o.rwNumber)}
                        aria-label={`Выделить ${o.rwNumber}`}
                        className="h-3.5 w-3.5 accent-brass-600"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-medium text-forest-900">
                      {o.isPublic ? (
                        <Link
                          href={`/object/${o.rwNumber}`}
                          className="text-brass-600 hover:underline"
                        >
                          {o.rwNumber}
                        </Link>
                      ) : (
                        o.rwNumber
                      )}
                    </td>
                    <td className="max-w-[280px] px-3 py-2">
                      <span className="line-clamp-1 text-forest-900/85">{o.titleEn || "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/70">{o.type}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-[11px] font-medium " +
                          (STATUS_STYLE[o.status] ?? "bg-forest-900/5 text-forest-900/50")
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/65">
                      {o.district || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/80">{o.priceText}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-forest-900/65">{o.areaText}</td>
                    <td className="px-3 py-2 text-center text-forest-900/60">{o.photos || "—"}</td>
                    <td className="px-3 py-2 text-center">
                      {o.isPublic ? (
                        <span
                          title="Виден на сайте"
                          className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"
                        />
                      ) : (
                        <span
                          title="Скрыт (не Active или без фото)"
                          className="inline-block h-2.5 w-2.5 rounded-full bg-forest-900/15"
                        />
                      )}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-center text-xs text-forest-900/60"
                      title="Просмотры на сайте: за 7 дней / за 30 дней (своя БД, не зависит от блокировщиков)"
                    >
                      {o.views30 > 0 ? (
                        <>
                          <span className="font-medium text-forest-900/80">{o.views7}</span>
                          <span className="text-forest-900/35"> / {o.views30}</span>
                        </>
                      ) : (
                        <span className="text-forest-900/25">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {o.leadCount > 0 ? (
                        <Link
                          href={`/admin/crm?q=${encodeURIComponent(o.rwNumber)}`}
                          title={`${o.leadCount} интересовавшихся — открыть в CRM`}
                          className="inline-flex items-center gap-0.5 rounded-full bg-brass-500/10 px-2 py-0.5 text-xs font-medium text-brass-600 hover:bg-brass-500/20"
                        >
                          👤 {o.leadCount}
                        </Link>
                      ) : (
                        <span className="text-forest-900/25">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <ObjectEditButton
                        object={{
                          rwNumber: o.rwNumber,
                          type: o.type,
                          status: o.status,
                          titleEn: o.titleEn,
                          district: o.district,
                          priceThb: o.priceThb,
                          pricePerRai: o.pricePerRai,
                          rentPerRaiMonth: o.rentPerRaiMonth,
                          leaseTermYears: o.leaseTermYears,
                          unitsAvailable: o.unitsAvailable,
                          locationUrl: o.locationUrl,
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
