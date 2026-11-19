"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useUrlTab } from "@/lib/hooks/use-url-tab";
import {
  createOwnerAction,
  deleteOwnerAction,
  linkObjectsAction,
  unlinkObjectAction,
  updateOwnerAction,
  type OwnerFields,
} from "@/lib/actions/owners";
import type { Owner, OwnerObject, OwnerStatus } from "@/lib/data/owners";

const STATUS_LABEL: Record<OwnerStatus, string> = {
  new: "Не связывались",
  contacted: "Связались",
  confirmed: "Подтвердил",
  no_answer: "Не отвечает",
  refused: "Отказ / не продаёт",
};
const ROLE_LABEL = { owner: "Собственник", developer: "Застройщик", broker: "Посредник" } as const;
const OUTREACH_LABEL: Record<string, string> = {
  confirmed: "✅ подтверждён",
  archived: "🗄 снят",
  leasehold_ok: "✅ leasehold",
  no_answer: "📵 недозвон",
};

const TABS = [
  { key: "all", label: "Все" },
  { key: "new", label: "Не связывались" },
  { key: "contacted", label: "Связались" },
  { key: "no_answer", label: "Не отвечает" },
  { key: "confirmed", label: "Подтвердили" },
  { key: "refused", label: "Отказ" },
  { key: "unassigned", label: "Объекты без собственника" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const input =
  "w-full rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm text-forest-900 placeholder:text-forest-500/50";
const btn =
  "rounded-sm px-3 py-1.5 text-sm font-medium transition disabled:opacity-50";

function nf(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
function stamp() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

function ObjectChip({ o, onUnlink }: { o: OwnerObject; onUnlink?: () => void }) {
  const live = ["Active", "Reserved", "Hold"].includes(o.status);
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
      <Link
        href={`/admin/objects/${o.rwNumber}` as Route}
        className="font-semibold text-forest-900 hover:text-brass-500"
      >
        {o.rwNumber}
      </Link>
      <span className="text-forest-500">
        {o.type} · {o.district ?? "район?"} · {o.priceThb ? `฿${nf(o.priceThb)}` : "без цены"}
      </span>
      {!live ? <span className="text-xs text-forest-500/70">{o.status}</span> : null}
      <span className="text-xs">
        {o.outreachStatus ? OUTREACH_LABEL[o.outreachStatus] ?? o.outreachStatus : "⏳ не проверен"}
        {o.outreachDate ? ` · ${o.outreachDate}` : ""}
      </span>
      {onUnlink ? (
        <button onClick={onUnlink} className="text-xs text-forest-500/60 hover:text-red-700" title="Отвязать">
          ✕
        </button>
      ) : null}
    </li>
  );
}

function ContactLinks({ o }: { o: Owner }) {
  const items: React.ReactNode[] = [];
  if (o.phone) items.push(<a key="p" href={`tel:${o.phone}`} className="text-brass-600 hover:underline">{o.phone}</a>);
  if (o.whatsapp)
    items.push(
      <a key="w" href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-brass-600 hover:underline">
        WhatsApp
      </a>,
    );
  if (o.line) items.push(<span key="l">LINE {o.line}</span>);
  if (o.telegram)
    items.push(
      <a key="t" href={`https://t.me/${o.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="text-brass-600 hover:underline">
        TG {o.telegram}
      </a>,
    );
  if (o.email) items.push(<a key="e" href={`mailto:${o.email}`} className="text-brass-600 hover:underline">{o.email}</a>);
  if (!items.length) return <span className="text-xs font-medium text-red-700">нет контакта — найти</span>;
  return <span className="flex flex-wrap gap-x-3 text-sm text-forest-500">{items}</span>;
}

function OwnerForm({
  initial,
  submitLabel,
  withObjects,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Owner>;
  submitLabel: string;
  withObjects?: boolean;
  onSubmit: (f: OwnerFields, rwText: string) => void;
  onCancel?: () => void;
}) {
  const [f, setF] = useState<OwnerFields>({
    name: initial?.name ?? "",
    role: initial?.role ?? "owner",
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    line: initial?.line ?? "",
    telegram: initial?.telegram ?? "",
    email: initial?.email ?? "",
    lang: initial?.lang ?? "",
  });
  const [rws, setRws] = useState("");
  const set = (k: keyof OwnerFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(f, rws);
      }}
      className="grid gap-2 sm:grid-cols-2"
    >
      <input className={input} placeholder="Имя *" value={f.name} onChange={set("name")} required />
      <div className="flex gap-2">
        <select className={input} value={f.role} onChange={set("role")}>
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className={input} value={f.lang ?? ""} onChange={set("lang")} aria-label="Язык общения">
          <option value="">Язык?</option>
          <option value="th">ไทย</option>
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </select>
      </div>
      <input className={input} placeholder="Телефон" value={f.phone} onChange={set("phone")} />
      <input className={input} placeholder="WhatsApp (номер)" value={f.whatsapp} onChange={set("whatsapp")} />
      <input className={input} placeholder="LINE ID" value={f.line} onChange={set("line")} />
      <input className={input} placeholder="Telegram @" value={f.telegram} onChange={set("telegram")} />
      <input className={input} placeholder="Email" value={f.email} onChange={set("email")} />
      {withObjects ? (
        <input className={input} placeholder="Объекты: RW-0519 RW-0541 …" value={rws} onChange={(e) => setRws(e.target.value)} />
      ) : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className={`${btn} bg-panel text-panel-fg`}>{submitLabel}</button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={`${btn} bg-forest-900/5 text-forest-900`}>
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}

function OwnerCard({ o, onError }: { o: Owner; onError: (msg: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState("");
  const [rws, setRws] = useState("");
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string; missing?: string[] }>, after?: () => void) {
    onError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) onError(res.error ?? "Не удалось сохранить");
      else if (res.missing?.length) onError(`Нет в базе: ${res.missing.join(", ")}`);
      else after?.();
    });
  }

  /** Итог касания: статус + строка в журнал с датой (история не затирается). */
  function touch(status: OwnerStatus) {
    const line = `${stamp()}: ${STATUS_LABEL[status]}${note.trim() ? ` — ${note.trim()}` : ""}`;
    run(() => updateOwnerAction(o.id, { status, note: o.note ? `${o.note}\n${line}` : line }, true), () => setNote(""));
  }

  return (
    <li className="rounded-sm border border-forest-900/10 bg-cream-50 p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold text-forest-900">{o.name}</span>
        <span className="text-xs text-forest-500">
          {ROLE_LABEL[o.role]}
          {o.lang ? ` · ${o.lang.toUpperCase()}` : ""}
        </span>
        <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-xs text-forest-900">{STATUS_LABEL[o.status]}</span>
        {o.lastTouchAt ? (
          <span className="text-xs text-forest-500/70">посл. касание {o.lastTouchAt.slice(0, 10)}</span>
        ) : null}
        <button onClick={() => setEditing((v) => !v)} className="ml-auto text-xs text-brass-600 hover:underline">
          {editing ? "Свернуть" : "Править"}
        </button>
      </div>
      <div className="mt-1"><ContactLinks o={o} /></div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <OwnerForm
            initial={o}
            submitLabel="Сохранить"
            onSubmit={(f) => run(() => updateOwnerAction(o.id, f), () => setEditing(false))}
            onCancel={() => setEditing(false)}
          />
          <button
            onClick={() => {
              if (confirm(`Удалить «${o.name}»? Объекты останутся, просто без собственника.`)) run(() => deleteOwnerAction(o.id));
            }}
            className="text-xs text-red-700 hover:underline"
          >
            Удалить собственника
          </button>
        </div>
      ) : null}

      <ul className="mt-3 space-y-1">
        {o.objects.length ? (
          o.objects.map((x) => (
            <ObjectChip key={x.rwNumber} o={x} onUnlink={() => run(() => unlinkObjectAction(x.rwNumber))} />
          ))
        ) : (
          <li className="text-xs text-forest-500/70">объекты не привязаны</li>
        )}
      </ul>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input className={input} placeholder="Привязать: RW-…" value={rws} onChange={(e) => setRws(e.target.value)} />
        <button
          disabled={pending || !rws.trim()}
          onClick={() => run(() => linkObjectsAction(o.id, rws), () => setRws(""))}
          className={`${btn} bg-forest-900/5 text-forest-900 hover:bg-forest-900/10`}
        >
          Привязать
        </button>
      </div>

      {o.note ? (
        <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-sm bg-white/60 p-2 font-sans text-xs text-forest-900/80">
          {o.note}
        </pre>
      ) : null}

      <div className="mt-3 flex flex-col gap-2">
        <input className={input} placeholder="Заметка к касанию (цена, условия, когда перезвонить)" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {(["contacted", "confirmed", "no_answer", "refused"] as const).map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() => touch(s)}
              className={`${btn} bg-forest-900/5 text-forest-900 hover:bg-forest-900/10`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <p className="text-xs text-forest-500/70">
          Цену и актуальность каждого объекта отмечай в{" "}
          <Link href={"/admin/outreach" as Route} className="text-brass-600 hover:underline">обзвоне</Link>{" "}
          или в карточке объекта.
        </p>
      </div>
    </li>
  );
}

export function OwnersBoard({ owners, unassigned }: { owners: Owner[]; unassigned: OwnerObject[] }) {
  const [tab, setTab] = useUrlTab<TabKey>("f", TABS.map((t) => t.key), "all");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const count = (k: TabKey) =>
    k === "all" ? owners.length : k === "unassigned" ? unassigned.length : owners.filter((o) => o.status === k).length;

  const needle = q.trim().toLowerCase();
  const visible = owners
    .filter((o) => tab === "all" || o.status === tab)
    .filter(
      (o) =>
        !needle ||
        [o.name, o.phone, o.whatsapp, o.line, o.telegram, o.email, ...o.objects.map((x) => x.rwNumber)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle)),
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "rounded-full px-3 py-1.5 text-sm font-medium transition " +
              (tab === t.key ? "bg-panel text-panel-fg" : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/10")
            }
          >
            {t.label} · {count(t.key)}
          </button>
        ))}
      </div>

      {error ? <p className="mb-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {tab === "unassigned" ? (
        <div className="rounded-sm border border-forest-900/10 bg-cream-50 p-4">
          <p className="mb-3 text-sm text-forest-900/70">
            Живые объекты, у которых в справочнике нет собственника. Подтвердить их цену и актуальность
            не у кого — найди собственника и привяжи объект к его карточке.
          </p>
          <ul className="space-y-1">
            {unassigned.map((o) => (
              <ObjectChip key={o.rwNumber} o={o} />
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              className={input}
              placeholder="Поиск: имя, телефон, RW-номер"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button onClick={() => setAdding((v) => !v)} className={`${btn} bg-panel text-panel-fg whitespace-nowrap`}>
              + Собственник
            </button>
          </div>
          {adding ? (
            <div className="mb-4 rounded-sm border border-forest-900/10 bg-cream-50 p-4">
              <OwnerForm
                submitLabel="Добавить"
                withObjects
                onCancel={() => setAdding(false)}
                onSubmit={(f, rws) => {
                  setError(null);
                  start(async () => {
                    const res = await createOwnerAction(f, rws);
                    if (!res.ok) setError(res.error ?? "Не удалось добавить");
                    else {
                      if (res.missing?.length) setError(`Добавлен, но нет в базе: ${res.missing.join(", ")}`);
                      setAdding(false);
                    }
                  });
                }}
              />
            </div>
          ) : null}
          <ul className="space-y-3">
            {visible.map((o) => (
              <OwnerCard key={o.id} o={o} onError={setError} />
            ))}
          </ul>
          {!visible.length ? <p className="text-sm text-forest-500/70">Никого не найдено.</p> : null}
        </>
      )}
    </div>
  );
}
