"use client";

import { useState, useTransition } from "react";
import { createPartnerAction, updatePartnerTermsAction } from "@/lib/actions/referral-actions";
import type { Partner, TermsStatus } from "@/lib/data/partner-referrals";

/**
 * Блок «Партнёры» раздела /admin/referrals — застройщики-плательщики
 * developer-fee. Карточка = контакт + linked RW + статус term-sheet с
 * артефактом акцепта (ГДЕ лежит скрин/переписка — не условия и не цифры;
 * суммы живут в личном учёте вне продукта).
 */

const TERMS_META: Record<TermsStatus, { label: string; cls: string }> = {
  draft: { label: "Term-sheet: черновик", cls: "bg-forest-900/5 text-forest-900/60" },
  sent: { label: "Term-sheet: отправлен", cls: "bg-brass-500/15 text-brass-600" },
  accepted: { label: "Term-sheet: принят", cls: "bg-forest-900/10 text-forest-900" },
  declined: { label: "Term-sheet: отклонён", cls: "bg-red-500/10 text-red-700" },
};

const TERMS_ORDER: TermsStatus[] = ["draft", "sent", "accepted", "declined"];

function fmtDate(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

export function ReferralPartners({ partners }: { partners: Partner[] }) {
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  // Черновики артефакта акцепта по партнёрам (ссылка/путь к скрину).
  const [artifacts, setArtifacts] = useState<Record<number, string>>({});
  const [, start] = useTransition();

  function applyTerms(p: Partner, status: TermsStatus) {
    setBusyId(p.id);
    setError(null);
    start(async () => {
      const res = await updatePartnerTermsAction(p.id, status, artifacts[p.id] ?? "");
      if (!res.ok) setError(res.error ?? "Не удалось сохранить");
      setBusyId(null);
    });
  }

  function submitNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      const res = await createPartnerAction(fd);
      if (!res.ok) setError(res.error ?? "Не удалось создать партнёра");
      else form.reset();
    });
  }

  return (
    <div>
      {error ? (
        <p className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {partners.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-sm text-forest-900/60">
          Партнёров пока нет. Заведи первого застройщика формой ниже — передачи лидов
          без партнёра не создаются.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {partners.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-2xl border border-forest-900/10 bg-cream-50 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-lg leading-snug text-forest-900">{p.name}</h3>
                <span
                  className={
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium " +
                    TERMS_META[p.termsStatus].cls
                  }
                >
                  {TERMS_META[p.termsStatus].label}
                </span>
              </div>
              <p className="mt-1 text-sm text-forest-900/60">
                {p.contactName ?? "—"}
                {p.messenger ? ` · ${p.messenger}` : ""}
              </p>
              {p.linkedRw && p.linkedRw.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.linkedRw.map((rw) => (
                    <span
                      key={rw}
                      className="rounded-full bg-forest-900/5 px-2 py-0.5 text-[11px] font-medium text-forest-900/70"
                    >
                      {rw}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-xs text-forest-900/50">
                Отправлен: {fmtDate(p.termsSentAt)} · Принят: {fmtDate(p.termsAcceptedAt)}
              </p>
              {p.termsArtifact ? (
                <p className="mt-1 break-all text-xs text-forest-900/50" title="Артефакт акцепта">
                  📎 {p.termsArtifact}
                </p>
              ) : null}
              {p.notes ? <p className="mt-1 text-xs text-forest-900/50">{p.notes}</p> : null}

              <div className="mt-auto pt-3">
                <input
                  value={artifacts[p.id] ?? ""}
                  onChange={(e) => setArtifacts((a) => ({ ...a, [p.id]: e.target.value }))}
                  placeholder="Артефакт: ссылка/скрин акцепта"
                  className="w-full rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1 text-xs text-forest-900 outline-none focus:border-brass-500"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {TERMS_ORDER.map((s) => (
                    <button
                      key={s}
                      disabled={busyId === p.id || p.termsStatus === s}
                      onClick={() => applyTerms(p, s)}
                      className={
                        "rounded-sm px-2 py-1 text-xs font-medium transition disabled:opacity-40 " +
                        (s === "declined"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : s === "accepted"
                            ? "bg-brass-500/15 text-forest-900 hover:bg-brass-500/30"
                            : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/10")
                      }
                    >
                      {s === "draft" ? "черновик" : s === "sent" ? "отправлен" : s === "accepted" ? "принят" : "отклонён"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={submitNew}
        className="mt-4 grid gap-2 rounded-2xl border border-forest-900/10 bg-cream-50 p-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <p className="text-sm font-semibold text-forest-900 sm:col-span-2 xl:col-span-3">
          Новый партнёр
        </p>
        <input
          name="name"
          required
          placeholder="Название (застройщик) *"
          className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
        />
        <input
          name="contactName"
          placeholder="Контактное лицо"
          className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
        />
        <input
          name="messenger"
          placeholder="Канал: tg/line/wa + хэндл"
          className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
        />
        <input
          name="linkedRw"
          placeholder="Linked RW (через запятую): RW-P0001, …"
          className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
        />
        <input
          name="notes"
          placeholder="Заметки"
          className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
        />
        <button
          type="submit"
          className="rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-panel-fg hover:bg-panel/90"
        >
          + Добавить партнёра
        </button>
      </form>
    </div>
  );
}
