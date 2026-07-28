"use client";

import { useState, useTransition } from "react";
import { generateCreativesAction } from "@/lib/actions/ad-creatives";
import { LIMITS, type AdChannel, type CreativeSet } from "@/lib/ads/creatives";
import { creativesToCsv } from "@/lib/ads/csv";

export interface AdsObjectOption {
  rwNumber: string;
  title: string;
  type: string;
  district: string;
  leasehold: boolean;
}

const CHANNELS: Array<{ key: AdChannel; label: string; hint: string }> = [
  { key: "meta", label: "Meta · Facebook / Instagram", hint: "лента, холодная аудитория острова" },
  { key: "google", label: "Google Search", hint: "поиск по намерению купить" },
];

const LANG_LABEL: Record<string, string> = { en: "🇬🇧 EN", ru: "🇷🇺 RU" };

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span className={over ? "text-red-600" : "text-forest-700/40 dark:text-cream-100/40"}>
      {value}/{max}
    </span>
  );
}

export function AdsGenerator({ options }: { options: AdsObjectOption[] }) {
  const [rw, setRw] = useState(options[0]?.rwNumber ?? "");
  const [channel, setChannel] = useState<AdChannel>("meta");
  const [sets, setSets] = useState<CreativeSet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateCreativesAction([rw], channel);
        if (result.length === 0) setError("Объект не найден в каталоге.");
        setSets(result);
      } catch {
        setError("Генерация не удалась. Попробуй ещё раз — объект и правила не пострадали.");
      }
    });
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function downloadCsv() {
    const blob = new Blob([creativesToCsv(sets)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rw-ads-${sets[0]?.rwNumber ?? "export"}-${channel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lim = LIMITS[channel];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-forest-900/10 bg-white/60 p-4 shadow-sm dark:bg-white/[0.03]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-forest-700/60">Объект</span>
            <select
              value={rw}
              onChange={(e) => setRw(e.target.value)}
              className="w-full rounded-xl border border-forest-900/15 bg-cream-50/60 px-3 py-2 text-sm dark:bg-white/[0.04]"
            >
              {options.map((o) => (
                <option key={o.rwNumber} value={o.rwNumber}>
                  {o.rwNumber} · {o.type} · {o.district}
                  {o.leasehold ? " · leasehold" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-forest-700/60">Канал</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as AdChannel)}
              className="w-full rounded-xl border border-forest-900/15 bg-cream-50/60 px-3 py-2 text-sm dark:bg-white/[0.04]"
            >
              {CHANNELS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label} — {c.hint}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={pending || !rw}
            className="rounded-xl bg-forest-800 px-4 py-2 text-sm font-medium text-cream-50 disabled:opacity-50"
          >
            {pending ? "Генерирую…" : "Сгенерировать"}
          </button>
          {sets.length > 0 && (
            <button
              type="button"
              onClick={downloadCsv}
              className="rounded-xl border border-forest-900/15 px-4 py-2 text-sm font-medium text-forest-800 dark:text-cream-100"
            >
              Скачать CSV
            </button>
          )}
          <span className="text-xs text-forest-700/50">
            лимиты: заголовок {lim.headline} · текст {lim.primary} · подпись {lim.description}
          </span>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {sets.map((set) => (
        <div key={set.rwNumber} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-forest-900 dark:text-cream-100">{set.rwNumber}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                set.fromLlm
                  ? "bg-forest-500/15 text-forest-700"
                  : "bg-brass-500/15 text-brass-700"
              }`}
            >
              {set.fromLlm ? "Claude" : "шаблон (без ключа или сбой LLM)"}
            </span>
            <button
              type="button"
              onClick={() => copy(set.landingUrl, `url-${set.rwNumber}`)}
              className="ml-auto truncate text-xs text-forest-700/60 underline decoration-dotted"
              title={set.landingUrl}
            >
              {copied === `url-${set.rwNumber}` ? "ссылка скопирована" : "копировать ссылку с UTM"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {set.variants.map((v, i) => {
              const id = `${set.rwNumber}-${i}`;
              const full = `${v.headline}\n\n${v.primary}\n\n${v.description}\n\n${set.landingUrl}`;
              return (
                <div
                  key={id}
                  className="rounded-2xl border border-forest-900/10 bg-cream-50/60 p-4 dark:bg-white/[0.02]"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-forest-700/60">
                    <span>{LANG_LABEL[v.lang] ?? v.lang}</span>
                    <button
                      type="button"
                      onClick={() => copy(full, id)}
                      className="ml-auto underline decoration-dotted"
                    >
                      {copied === id ? "скопировано" : "копировать"}
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-forest-900 dark:text-cream-100">
                    {v.headline}{" "}
                    <Counter value={v.headline.length} max={lim.headline} />
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-forest-900/90 dark:text-cream-100/90">
                    {v.primary}
                  </p>
                  <p className="mt-1 text-xs">
                    <Counter value={v.primary.length} max={lim.primary} />
                  </p>
                  <p className="mt-2 text-sm text-forest-700/80 dark:text-cream-100/70">
                    {v.description} <Counter value={v.description.length} max={lim.description} />
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
