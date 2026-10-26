"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { createReferralAction, updateReferralAction } from "@/lib/actions/referral-actions";
import type { Partner, PartnerReferral, ReferralStatus } from "@/lib/data/partner-referrals";

/**
 * Блок «Передачи» /admin/referrals — двухшаговый протокол передачи лида
 * партнёру: тизер (без контакта клиента) → ack партнёра → контакт. Гейт:
 * handed доступен только при confirmed_at + ack_artifact (дублируется на
 * backend). Денежных полей нет — только статусы и артефакты.
 */

export interface LeadOption {
  id: number;
  label: string;
}

export interface ObjectOption {
  rw: string;
  title: string;
}

const STATUS_META: Record<ReferralStatus, { label: string; cls: string }> = {
  teaser_sent: { label: "Тизер отправлен", cls: "bg-forest-900/5 text-forest-900/60" },
  confirmed: { label: "Подтверждён (ack)", cls: "bg-brass-500/15 text-brass-600" },
  handed: { label: "Контакт передан", cls: "bg-forest-900/10 text-forest-900" },
  viewing: { label: "Показ", cls: "bg-brass-500/15 text-brass-600" },
  negotiation: { label: "Переговоры", cls: "bg-brass-500/15 text-brass-600" },
  closed: { label: "Закрыт", cls: "bg-forest-900/10 text-forest-900" },
  lost: { label: "Потерян", cls: "bg-red-500/10 text-red-700" },
};

const FLOW: ReferralStatus[] = [
  "teaser_sent",
  "confirmed",
  "handed",
  "viewing",
  "negotiation",
  "closed",
  "lost",
];

// Шаблон тизера — квалификация без контакта клиента и БЕЗ цифр комиссии.
const TEASER_TEMPLATE =
  "New client for you: budget […], timeline […], looking for […]. " +
  "Confirm: new client, our terms apply — and I will share the contact.";

function fmtDate(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

/** Просрочен = дата follow-up уже прошла (вчера и раньше; полночь даты + сутки). */
function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() + 86_400_000 < Date.now();
}

export function ReferralHandovers({
  referrals,
  partners,
  leads,
  objects,
}: {
  referrals: PartnerReferral[];
  partners: Partner[];
  leads: LeadOption[];
  objects: ObjectOption[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [teaser, setTeaser] = useState("");
  // Локальные черновики полей по передачам (ack / follow-up / причина отказа).
  const [ack, setAck] = useState<Record<number, string>>({});
  const [followUp, setFollowUp] = useState<Record<number, string>>({});
  const [lostReason, setLostReason] = useState<Record<number, string>>({});
  const [, start] = useTransition();

  function patch(id: number, body: Parameters<typeof updateReferralAction>[1]) {
    setBusyId(id);
    setError(null);
    start(async () => {
      const res = await updateReferralAction(id, body);
      if (!res.ok) setError(res.error ?? "Не удалось сохранить");
      setBusyId(null);
    });
  }

  function applyStatus(r: PartnerReferral, s: ReferralStatus) {
    const body: Parameters<typeof updateReferralAction>[1] = { status: s };
    // confirmed фиксирует ack-артефакт (обязателен — гейт двухшаговой передачи).
    if (s === "confirmed" && (ack[r.id] ?? "").trim()) body.ackArtifact = ack[r.id].trim();
    if (s === "lost") body.lostReason = (lostReason[r.id] ?? "").trim();
    patch(r.id, body);
  }

  /** Гейты кнопок: confirmed без ack и handed без confirmed+ack — выключены. */
  function statusDisabled(r: PartnerReferral, s: ReferralStatus): boolean {
    if (r.status === s) return true;
    if (s === "confirmed") return !(ack[r.id] ?? r.ackArtifact ?? "").trim();
    if (s === "handed") return !(r.confirmedAt && (r.ackArtifact ?? "").trim());
    if (s === "lost") return !(lostReason[r.id] ?? "").trim();
    return false;
  }

  function submitNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      const res = await createReferralAction(fd);
      if (!res.ok) setError(res.error ?? "Не удалось создать передачу");
      else {
        form.reset();
        setTeaser("");
      }
    });
  }

  return (
    <div>
      {error ? (
        <p className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {referrals.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-sm text-forest-900/60">
          Передач пока нет. Первая = форма ниже: лид + партнёр + тизер (без контакта
          клиента). Контакт уходит партнёру только после его ack.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-forest-900/10">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-forest-900/5 text-left text-forest-500">
              <tr>
                <th className="w-8 px-2 py-2" />
                <th className="px-3 py-2 font-medium">Лид</th>
                <th className="px-3 py-2 font-medium">Партнёр</th>
                <th className="px-3 py-2 font-medium">Объект</th>
                <th className="px-3 py-2 font-medium">Статус</th>
                <th className="px-3 py-2 font-medium">Защита до</th>
                <th className="px-3 py-2 font-medium">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => {
                const open = openId === r.id;
                const overdue = isOverdue(r.nextFollowUp);
                return [
                  <tr key={r.id} className="border-t border-forest-900/10">
                    <td className="px-2 py-2">
                      <button
                        onClick={() => setOpenId(open ? null : r.id)}
                        className="rounded-sm p-1 text-forest-500 hover:bg-forest-900/5 hover:text-forest-900"
                        aria-label={open ? "Свернуть" : "Развернуть передачу"}
                      >
                        {open ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-medium text-forest-900">
                      {r.leadName ?? `#${r.leadId}`}
                    </td>
                    <td className="px-3 py-2">{r.partnerName ?? `#${r.partnerId}`}</td>
                    <td className="px-3 py-2">{r.objectRw ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] font-medium " +
                          STATUS_META[r.status].cls
                        }
                      >
                        {STATUS_META[r.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-forest-900/70">{fmtDate(r.protectionUntil)}</td>
                    <td className="px-3 py-2">
                      <span className={overdue ? "font-semibold text-red-700" : "text-forest-900/70"}>
                        {fmtDate(r.nextFollowUp)}
                        {overdue ? " · просрочен" : ""}
                      </span>
                    </td>
                  </tr>,
                  open ? (
                    <tr key={`${r.id}-details`} className="border-t border-forest-900/5 bg-cream-100/40">
                      <td />
                      <td colSpan={6} className="px-3 py-4">
                        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-forest-500">
                              Тизер (ушёл партнёру — без контакта клиента)
                            </p>
                            <p className="whitespace-pre-wrap rounded-sm bg-forest-900/5 px-3 py-2 text-sm text-forest-900">
                              {r.teaserText ?? "—"}
                            </p>
                            <p className="mt-2 text-xs text-forest-900/50">
                              Fee milestone: {r.feeMilestone ?? "—"} · Verified by:{" "}
                              {r.verifiedBy ?? "—"} · Последний контакт с клиентом:{" "}
                              {fmtDate(r.lastClientTouch)}
                              {r.lostReason ? ` · Причина потери: ${r.lostReason}` : ""}
                            </p>

                            <p className="mb-1 mt-4 text-xs font-medium uppercase tracking-wide text-forest-500">
                              Статус
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {FLOW.map((s) => (
                                <button
                                  key={s}
                                  disabled={busyId === r.id || statusDisabled(r, s)}
                                  onClick={() => applyStatus(r, s)}
                                  title={
                                    s === "handed"
                                      ? "Только после confirmed + ack-артефакта"
                                      : s === "confirmed"
                                        ? "Нужен ack-артефакт (поле справа)"
                                        : undefined
                                  }
                                  className={
                                    "rounded-sm px-2 py-1 text-xs font-medium transition disabled:opacity-40 " +
                                    (s === "lost"
                                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                                      : s === "handed" || s === "closed"
                                        ? "bg-brass-500/15 text-forest-900 hover:bg-brass-500/30"
                                        : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/10")
                                  }
                                >
                                  {STATUS_META[s].label}
                                </button>
                              ))}
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-forest-500/80">
                              «Контакт передан» открывается только после ack партнёра
                              (confirmed + артефакт) — тогда backend сам ставит handed_at и
                              защиту атрибуции +12 месяцев.
                            </p>
                          </div>
                          <div className="space-y-3">
                            <label className="block text-xs font-medium uppercase tracking-wide text-forest-500">
                              Ack-артефакт (скрин/ссылка на подтверждение)
                              <div className="mt-1 flex gap-1.5">
                                <input
                                  value={ack[r.id] ?? r.ackArtifact ?? ""}
                                  onChange={(e) =>
                                    setAck((a) => ({ ...a, [r.id]: e.target.value }))
                                  }
                                  placeholder="tg-скрин / ссылка на переписку"
                                  className="w-full rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1 text-sm text-forest-900 outline-none focus:border-brass-500"
                                />
                                <button
                                  disabled={busyId === r.id || !(ack[r.id] ?? "").trim()}
                                  onClick={() => patch(r.id, { ackArtifact: ack[r.id].trim() })}
                                  className="rounded-sm bg-forest-900/5 px-2 py-1 text-xs font-medium text-forest-900 hover:bg-forest-900/10 disabled:opacity-40"
                                >
                                  Сохранить
                                </button>
                              </div>
                            </label>
                            <label className="block text-xs font-medium uppercase tracking-wide text-forest-500">
                              Следующий follow-up
                              <div className="mt-1 flex gap-1.5">
                                <input
                                  type="date"
                                  value={followUp[r.id] ?? r.nextFollowUp?.slice(0, 10) ?? ""}
                                  onChange={(e) =>
                                    setFollowUp((f) => ({ ...f, [r.id]: e.target.value }))
                                  }
                                  className="w-full rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1 text-sm text-forest-900 outline-none focus:border-brass-500"
                                />
                                <button
                                  disabled={busyId === r.id || followUp[r.id] === undefined}
                                  onClick={() =>
                                    patch(r.id, { nextFollowUp: followUp[r.id] || null })
                                  }
                                  className="rounded-sm bg-forest-900/5 px-2 py-1 text-xs font-medium text-forest-900 hover:bg-forest-900/10 disabled:opacity-40"
                                >
                                  Сохранить
                                </button>
                              </div>
                            </label>
                            <label className="block text-xs font-medium uppercase tracking-wide text-forest-500">
                              Причина потери (для статуса «Потерян»)
                              <input
                                value={lostReason[r.id] ?? r.lostReason ?? ""}
                                onChange={(e) =>
                                  setLostReason((l) => ({ ...l, [r.id]: e.target.value }))
                                }
                                placeholder="Почему сорвалось"
                                className="mt-1 w-full rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1 text-sm text-forest-900 outline-none focus:border-brass-500"
                              />
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null,
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={submitNew}
        className="mt-4 grid gap-2 rounded-2xl border border-forest-900/10 bg-cream-50 p-4"
      >
        <p className="text-sm font-semibold text-forest-900">Новая передача</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            name="leadId"
            required
            defaultValue=""
            className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
          >
            <option value="" disabled>
              Лид *
            </option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            name="partnerId"
            required
            defaultValue=""
            className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
          >
            <option value="" disabled>
              Партнёр *
            </option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.termsStatus !== "accepted" ? " (term-sheet не принят)" : ""}
              </option>
            ))}
          </select>
          <input
            name="objectRw"
            list="referral-object-rw"
            placeholder="Объект RW (опционально)"
            className="rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
          />
          <datalist id="referral-object-rw">
            {objects.map((o) => (
              <option key={o.rw} value={o.rw}>
                {o.title}
              </option>
            ))}
          </datalist>
        </div>
        <div className="flex items-start gap-2">
          <textarea
            name="teaserText"
            required
            rows={3}
            value={teaser}
            onChange={(e) => setTeaser(e.target.value)}
            placeholder="Тизер партнёру: бюджет, сроки, что ищет — БЕЗ имени и контакта клиента, без цифр комиссии"
            className="w-full rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500"
          />
          <button
            type="button"
            onClick={() => setTeaser(TEASER_TEMPLATE)}
            className="shrink-0 rounded-full border border-brass-500/40 px-3 py-1.5 text-xs font-medium text-brass-600 hover:bg-brass-500/10"
            title="Подставить шаблон тизера"
          >
            Шаблон
          </button>
        </div>
        <button
          type="submit"
          className="justify-self-start rounded-full bg-panel px-4 py-1.5 text-sm font-medium text-panel-fg hover:bg-panel/90"
        >
          + Создать передачу
        </button>
      </form>
    </div>
  );
}
