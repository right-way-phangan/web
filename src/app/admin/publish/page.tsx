import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { backendFetch } from "@/lib/api/backend";
import { getAllObjects } from "@/lib/data/objects";

export const metadata: Metadata = {
  title: "Публикация — гейт качества",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Форма ответа /objects/:rw/publishable (см. backend/src/lib/publishable.ts). */
type PublishableObject = {
  rwNumber: string;
  title: string;
  typeLabel: string;
  district?: string;
  tenureLabel?: string;
  priceThb?: number;
  pricePerRai?: number;
  vetted: boolean;
  gallery: string[];
  mapUrl?: string;
  url: string;
  description?: string;
};
type PublishResult =
  | { ok: true; rwNumber: string; object: PublishableObject; warnings: string[] }
  | { ok: false; rwNumber: string; reasons: string[]; warnings: string[] };
type Resp = { result: PublishResult; text: string | null };

type PageProps = {
  searchParams: Promise<{ rw?: string; lang?: string; channel?: string }>;
};

const LANGS = [
  { key: "en", label: "EN" },
  { key: "ru", label: "RU" },
] as const;

export default async function PublishPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const rw = typeof sp.rw === "string" ? sp.rw : undefined;
  const lang = sp.lang === "ru" ? "ru" : "en";
  const channel = sp.channel || "telegram";

  const all = await getAllObjects();
  const active = all
    .filter((o) => o.status === "Active" && o.rwNumber)
    .sort((a, b) => (a.rwNumber > b.rwNumber ? 1 : -1));

  let resp: Resp | null = null;
  let fetchError: string | null = null;
  if (rw) {
    try {
      const r = await backendFetch(
        `/objects/${encodeURIComponent(rw)}/publishable?channel=${encodeURIComponent(channel)}&lang=${lang}`,
        { cache: "no-store" },
      );
      if (r.ok) resp = (await r.json()) as Resp;
      else fetchError = `API ${r.status}`;
    } catch (err) {
      fetchError = err instanceof Error ? err.message : "fetch failed";
    }
  }

  const langHref = (l: string): Route =>
    ({ pathname: "/admin/publish", query: { ...(rw ? { rw } : {}), lang: l, channel } }) as unknown as Route;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="publish" />
      <div className="max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · гейт качества перед публикацией
        </p>
        <h1 className="mt-2 font-serif text-3xl text-forest-900">Публикация</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-900/70">
          Что именно безопасно уйдёт в канал. Гейт собирает пост по{" "}
          <strong>allowlist</strong> (только разрешённые поля), редактирует конфиденциальное
          (номер документа · комиссия · прайс-лист застройщика), вырезает контакты, ставит бейдж
          Vetted только по DD-статусу и не отдаёт точные координаты у земли. Превью — для ручного и
          полу-ручного постинга; тот же контракт переиспользует будущий авто-fan-out.
        </p>

        {/* Язык */}
        <div className="mt-5 flex items-center gap-2">
          <span className="text-xs text-forest-900/55">Язык поста:</span>
          {LANGS.map((l) => (
            <Link
              key={l.key}
              href={langHref(l.key)}
              className={
                "rounded-full px-3 py-1 text-xs font-semibold transition " +
                (lang === l.key
                  ? "bg-forest-900 text-cream-50"
                  : "bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Превью выбранного объекта */}
        {rw && (
          <div className="mt-6">
            {fetchError && (
              <p className="rounded-2xl border border-red-500/40 bg-red-50 px-5 py-4 text-sm text-red-700">
                Не удалось получить превью {rw}: {fetchError}
              </p>
            )}

            {resp && resp.result.ok && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-2xl text-forest-900">{rw}</h2>
                  {resp.result.object.vetted && (
                    <span className="rounded-full bg-forest-500/15 px-2.5 py-1 text-xs font-semibold text-forest-700">
                      ✅ Vetted (DD L1)
                    </span>
                  )}
                  <span className="rounded-full bg-forest-900/5 px-2.5 py-1 text-xs text-forest-900/60">
                    {resp.result.object.gallery.length} фото
                  </span>
                </div>

                <div className="rounded-2xl border border-forest-900/10 bg-white p-5">
                  <p className="mb-2 text-xs uppercase tracking-wide text-forest-900/45">
                    Текст поста ({channel} · {lang.toUpperCase()})
                  </p>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-forest-900/90">
                    {resp.text}
                  </pre>
                </div>

                {resp.result.warnings.length > 0 && (
                  <div className="rounded-2xl border border-brass-500/40 bg-brass-500/[0.06] p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brass-600">
                      Предупреждения ({resp.result.warnings.length}) — публикуется, но проверьте
                    </p>
                    <ul className="space-y-1 text-sm text-forest-900/75">
                      {resp.result.warnings.map((w, i) => (
                        <li key={i}>· {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-forest-900/45">
                  Канонический линк:{" "}
                  <span className="text-forest-600">{resp.result.object.url}</span>
                </p>
              </div>
            )}

            {resp && !resp.result.ok && (
              <div className="rounded-2xl border border-red-500/40 bg-red-50 p-5">
                <h2 className="font-serif text-xl text-forest-900">{rw} — не публикуется</h2>
                <ul className="mt-2 space-y-1 text-sm text-red-700">
                  {resp.result.reasons.map((r, i) => (
                    <li key={i}>● {r}</li>
                  ))}
                </ul>
                {resp.result.warnings.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-forest-900/55">
                    {resp.result.warnings.map((w, i) => (
                      <li key={i}>· {w}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-forest-900/50">
                  Чинить в{" "}
                  <Link
                    href={{ pathname: "/admin/objects", query: { q: rw } } as unknown as Route}
                    className="text-forest-500 hover:text-brass-500"
                  >
                    Базе объектов
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        )}

        {/* Выбор объекта */}
        <div className="mt-8">
          <p className="mb-2 text-xs uppercase tracking-wide text-forest-900/45">
            Active-объекты ({active.length}) — выберите для превью
          </p>
          <div className="flex max-h-72 flex-wrap gap-1.5 overflow-y-auto rounded-2xl border border-forest-900/10 bg-cream-50/40 p-3">
            {active.map((o) => (
              <Link
                key={o.rwNumber}
                href={
                  {
                    pathname: "/admin/publish",
                    query: { rw: o.rwNumber, lang, channel },
                  } as unknown as Route
                }
                title={o.titleEn}
                className={
                  "inline-block rounded-full px-2.5 py-1 text-xs transition " +
                  (o.rwNumber === rw
                    ? "bg-forest-900 text-cream-50"
                    : "bg-white text-forest-900/75 hover:bg-forest-900/10")
                }
              >
                {o.rwNumber}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-forest-900/45">
          Решение и правила — в{" "}
          <Link href={"/admin/guide/publish" as Route} className="text-forest-500 hover:text-brass-500">
            справочнике
          </Link>{" "}
          и ТЗ «автопубликация и дистрибуция (fan-out)».
        </p>
      </div>
    </section>
  );
}
