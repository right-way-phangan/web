"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Heart, Search, UserPlus } from "lucide-react";
import { adminMatch, createMatchLead } from "@/lib/actions/match-admin";
import type { BuyerProfile, MatchFeature, MatchResult } from "@/types/match";
import type { ObjectType, TenureType } from "@/types/object";
import { cn } from "@/lib/utils/cn";

const GOALS = ["live", "invest", "rent-out", "vacation", "mixed"] as const;
const TYPES: ObjectType[] = ["Land", "Villa", "House", "Apartment", "Project"];
const TENURES: TenureType[] = ["Freehold", "Leasehold"];
const FEATURES: MatchFeature[] = [
  "seaView",
  "beachfront",
  "mountainView",
  "quiet",
  "flatLand",
  "pool",
  "gated",
  "parking",
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-brass-500/50 bg-brass-500/15 text-forest-900"
          : "border-forest-900/15 text-forest-900/60 hover:border-brass-500/40",
      )}
    >
      {children}
    </button>
  );
}

/**
 * /admin/match — агент подбирает объекты под walk-in клиента: заполняет профиль,
 * получает ранжированную выдачу (вкл. Hold), отмечает понравившиеся и заводит
 * лид с профилем в CRM. Тот же движок, что и на публичной /match.
 */
export function AdminMatch({ districts }: { districts: string[] }) {
  const [profile, setProfile] = useState<BuyerProfile>({ lang: "ru" });
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  // Данные клиента для лида
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("walk-in");
  const [leadMsg, setLeadMsg] = useState<string | null>(null);

  const toggleIn = <T,>(key: keyof BuyerProfile, value: T) =>
    setProfile((p) => {
      const cur = (p[key] as T[] | undefined) ?? [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...p, [key]: next.length ? next : undefined };
    });

  function run() {
    startTransition(async () => {
      const res = await adminMatch(profile, "ru");
      setResults(res.results);
    });
  }

  function makeLead() {
    setLeadMsg(null);
    startTransition(async () => {
      const res = await createMatchLead({
        name,
        phone,
        source,
        profile,
        likedRws: [...liked],
      });
      setLeadMsg(res.ok ? `✓ Лид создан (#${res.leadId})` : `⚠️ ${res.error}`);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      {/* Профиль клиента */}
      <div className="space-y-4 rounded-xl border border-forest-900/10 bg-cream-50 p-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-forest-900/45">
            Цель
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {GOALS.map((g) => (
              <Chip
                key={g}
                active={profile.goal === g}
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    goal: p.goal === g ? undefined : g,
                  }))
                }
              >
                {g}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-forest-900/45">
            Тип
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TYPES.map((tp) => (
              <Chip
                key={tp}
                active={profile.type?.includes(tp) ?? false}
                onClick={() => toggleIn<ObjectType>("type", tp)}
              >
                {tp}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-forest-900/45">
              Бюджет от, M฿
            </label>
            <input
              type="number"
              value={profile.budgetMinMThb ?? ""}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  budgetMinMThb: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              className="mt-1.5 w-full rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-forest-900/45">
              до, M฿
            </label>
            <input
              type="number"
              value={profile.budgetMaxMThb ?? ""}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  budgetMaxMThb: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              className="mt-1.5 w-full rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-forest-900/45">
            Район
          </label>
          <select
            multiple
            value={profile.districts ?? []}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                districts:
                  [...e.target.selectedOptions]
                    .map((o) => o.value)
                    .slice(0, 6) || undefined,
              }))
            }
            className="mt-1.5 h-28 w-full rounded-sm border border-forest-900/15 bg-white px-2 py-1 text-sm"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-forest-900/45">
              Владение
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TENURES.map((tn) => (
                <Chip
                  key={tn}
                  active={profile.tenure?.includes(tn) ?? false}
                  onClick={() => toggleIn<TenureType>("tenure", tn)}
                >
                  {tn}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-forest-900/45">
              Спален от
            </label>
            <input
              type="number"
              value={profile.bedroomsMin ?? ""}
              onChange={(e) =>
                setProfile((p) => ({
                  ...p,
                  bedroomsMin: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              className="mt-1.5 w-full rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-forest-900/45">
            Важно
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {FEATURES.map((f) => (
              <Chip
                key={f}
                active={profile.mustHaves?.includes(f) ?? false}
                onClick={() => toggleIn<MatchFeature>("mustHaves", f)}
              >
                {f}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-forest-900/45">
            Заметки
          </label>
          <textarea
            rows={2}
            value={profile.notes ?? ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, notes: e.target.value || undefined }))
            }
            placeholder="стиль, community, что нельзя…"
            className="mt-1.5 w-full rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-panel px-4 py-2.5 text-sm font-medium text-panel-fg transition-colors hover:bg-forest-400 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          Подобрать
        </button>
      </div>

      {/* Выдача + лид */}
      <div className="space-y-4">
        {results === null ? (
          <p className="rounded-xl border border-dashed border-forest-900/15 p-8 text-center text-sm text-forest-900/45">
            Заполните профиль клиента слева и нажмите «Подобрать».
          </p>
        ) : results.length === 0 ? (
          <p className="rounded-xl border border-forest-900/10 bg-cream-50 p-6 text-sm text-forest-900/60">
            Подходящих объектов не нашлось — ослабьте критерии или создайте лид
            для ручного подбора.
          </p>
        ) : (
          <ul className="space-y-2">
            {results.map((r) => (
              <li
                key={r.rw}
                className="flex items-center gap-3 rounded-lg border border-forest-900/10 bg-cream-50 p-3"
              >
                <span className="inline-flex shrink-0 items-center rounded-sm bg-brass-500 px-2 py-1 text-[11px] font-semibold text-panel-fg">
                  {r.fitPct}%
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/object/${r.rw}` as Route}
                    target="_blank"
                    className="block truncate text-sm font-medium text-forest-900 hover:text-brass-500"
                  >
                    {r.rw} · {r.card.titleEn}
                  </Link>
                  <p className="truncate text-xs text-forest-900/55">
                    {r.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLiked((s) => {
                      const n = new Set(s);
                      if (n.has(r.rw)) n.delete(r.rw);
                      else n.add(r.rw);
                      return n;
                    })
                  }
                  aria-pressed={liked.has(r.rw)}
                  className={cn(
                    "shrink-0 rounded-sm p-1.5 transition-colors",
                    liked.has(r.rw)
                      ? "text-brass-500"
                      : "text-forest-900/35 hover:text-brass-500",
                  )}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={liked.has(r.rw) ? "currentColor" : "none"}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Создать лид */}
        <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
          <p className="text-xs uppercase tracking-wide text-forest-900/45">
            Завести лид клиента
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя *"
              className="rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Телефон"
              className="rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
            />
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm"
            >
              {[
                "walk-in",
                "phone",
                "referral",
                "telegram",
                "whatsapp",
                "ad",
                "other",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={makeLead}
              disabled={pending || name.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-sm border border-forest-900/20 px-4 py-2 text-sm text-forest-900 transition-colors hover:border-brass-500/40 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Создать лид
            </button>
            {leadMsg ? (
              <span className="text-sm text-forest-900/70">{leadMsg}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
