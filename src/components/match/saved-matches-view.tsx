import { notFound } from "next/navigation";
import { fetchMatchProfile } from "@/lib/actions/match-save";
import { getPublicObjects } from "@/lib/data/objects";
import { shortlistCandidates, deterministicRank } from "@/lib/match/engine";
import { ObjectCard } from "@/components/objects/object-card";
import { MatchUnsubscribe } from "@/components/match/match-unsubscribe";

/**
 * Страница «Мои совпадения» — magic-link по HMAC-токену. Читает сохранённый
 * профиль из своей БД и считает актуальную выдачу ТЕМ ЖЕ движком (детерминированно,
 * без LLM — страницу могут открывать многократно). Клиентский канал без пуш-инфры.
 */

const COPY = {
  en: {
    title: "Your matches",
    lede: "Saved from your AI match. This page updates as new listings come in.",
    fit: "fit",
    empty:
      "No close matches in the public catalog right now — we'll keep looking.",
    inactive: "Notifications for this profile are off.",
    unsub: "Turn off notifications",
    unsubDone: "Notifications turned off.",
  },
  ru: {
    title: "Ваши совпадения",
    lede: "Сохранено из ИИ-подбора. Страница обновляется по мере появления объектов.",
    fit: "фит",
    empty:
      "Близких совпадений в публичном каталоге пока нет — мы продолжаем искать.",
    inactive: "Уведомления по этому профилю отключены.",
    unsub: "Отключить уведомления",
    unsubDone: "Уведомления отключены.",
  },
} as const;

export async function SavedMatchesView({
  token,
  locale,
}: {
  token: string;
  locale: "en" | "ru";
}) {
  const saved = await fetchMatchProfile(token);
  if (!saved) notFound();

  const objects = await getPublicObjects();
  const { candidates } = shortlistCandidates(objects, saved.profile);
  const results = deterministicRank(saved.profile, candidates, locale, 12);
  const t = COPY[locale];

  return (
    <section className="container-prose py-12">
      <h1 className="font-serif text-3xl text-forest-900">{t.title}</h1>
      <p className="mt-2 max-w-prose text-sm text-forest-500/75">{t.lede}</p>
      {!saved.active ? (
        <p className="mt-3 text-sm text-brass-500">{t.inactive}</p>
      ) : null}

      {results.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <div key={r.rw} className="flex flex-col">
              <span className="mb-2 inline-flex w-fit items-center rounded-sm bg-brass-500 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-panel-fg">
                {r.fitPct}% {t.fit}
              </span>
              <ObjectCard object={r.card} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-forest-500/75">{t.empty}</p>
      )}

      <div className="mt-12 border-t border-forest-500/10 pt-6">
        <MatchUnsubscribe
          token={token}
          labels={{ unsub: t.unsub, done: t.unsubDone }}
        />
      </div>
    </section>
  );
}
