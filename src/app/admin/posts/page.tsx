import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  getSocialPosts,
  groupByPair,
  type SocialPostPair,
  type SocialPostStatus,
} from "@/lib/data/social-posts";
import { approvePostPair, reopenPostPair, rejectPostPair } from "@/lib/actions/post-actions";

export const metadata: Metadata = {
  title: "Посты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_META: Record<SocialPostStatus, { label: string; cls: string }> = {
  draft: { label: "черновик", cls: "bg-brass-500/15 text-brass-700" },
  scheduled: { label: "согласован · ждёт запуска", cls: "bg-forest-500/15 text-forest-700" },
  published: { label: "опубликован", cls: "bg-forest-600/20 text-forest-800" },
  rejected: { label: "отклонён", cls: "bg-red-500/10 text-red-700/80" },
};

const LANG_FLAG: Record<string, string> = { en: "🇬🇧 EN", ru: "🇷🇺 RU" };

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PairCard({ pair }: { pair: SocialPostPair }) {
  const ids = pair.versions.map((v) => v.id);
  const st = STATUS_META[pair.status];
  const note = pair.versions.find((v) => v.reviewerNote)?.reviewerNote;
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-white/60 p-4 shadow-sm dark:bg-white/[0.03]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
          {st.label}
        </span>
        <span className="text-sm font-semibold text-forest-800 dark:text-cream-100">
          {pair.topic || "— без темы —"}
        </span>
        <span className="ml-auto text-xs text-forest-700/50">{fmt(pair.createdAt)}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {pair.versions.map((v) => (
          <div key={v.id} className="rounded-xl border border-forest-900/10 bg-cream-50/60 p-3 dark:bg-white/[0.02]">
            <div className="mb-1 text-xs font-medium text-forest-700/60">
              {LANG_FLAG[v.lang] ?? v.lang.toUpperCase()}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-forest-900/90 dark:text-cream-100/90">
              {v.body}
            </p>
          </div>
        ))}
      </div>

      {note && (
        <p className="mt-3 rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-700/80">
          Причина возврата: {note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pair.status === "draft" && (
          <>
            <form action={approvePostPair.bind(null, ids)}>
              <button className="rounded-lg bg-forest-700 px-3 py-1.5 text-sm font-medium text-cream-50 transition hover:bg-forest-800">
                ✅ Согласовать
              </button>
            </form>
            <details className="group">
              <summary className="cursor-pointer list-none rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-700/80 transition hover:bg-red-500/5">
                ✖️ Отклонить
              </summary>
              <form action={rejectPostPair} className="mt-2 flex flex-col gap-2">
                <input type="hidden" name="ids" value={ids.join(",")} />
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Причина (что поправить) — необязательно"
                  className="w-full rounded-lg border border-forest-900/15 bg-white/70 px-2 py-1 text-sm dark:bg-white/[0.04]"
                />
                <button className="self-start rounded-lg bg-red-600/90 px-3 py-1.5 text-sm font-medium text-cream-50 transition hover:bg-red-700">
                  Отклонить пару
                </button>
              </form>
            </details>
          </>
        )}
        {(pair.status === "scheduled" || pair.status === "rejected") && (
          <form action={reopenPostPair.bind(null, ids)}>
            <button className="rounded-lg border border-brass-500/40 px-3 py-1.5 text-sm text-brass-700 transition hover:bg-brass-500/10">
              ↩ В черновики
            </button>
          </form>
        )}
        {pair.status === "scheduled" && (
          <span className="text-xs text-forest-700/50">
            публикация в канал — после запуска
          </span>
        )}
      </div>
    </div>
  );
}

function Section({ title, pairs }: { title: string; pairs: SocialPostPair[] }) {
  if (!pairs.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-700/60">
        {title} · {pairs.length}
      </h2>
      <div className="flex flex-col gap-3">
        {pairs.map((p) => (
          <PairCard key={p.pairId} pair={p} />
        ))}
      </div>
    </section>
  );
}

export default async function AdminPostsPage() {
  const rows = await getSocialPosts();
  const pairs = groupByPair(rows);
  const byStatus = (s: SocialPostStatus) => pairs.filter((p) => p.status === s);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <AdminNav active="posts" />

      <header className="mb-6 mt-4">
        <h1 className="font-display text-2xl text-forest-900 dark:text-cream-50">
          Соц-посты — очередь Гермеса
        </h1>
        <p className="mt-1 text-sm text-forest-700/70 dark:text-cream-100/60">
          Гермес пишет черновики пары EN+RU (бот <code>/пост</code>). Вычитай и согласуй.
          <strong> Публикация в канал держится до запуска</strong> — «согласован» = готово,
          постим вручную после старта.
        </p>
      </header>

      {pairs.length === 0 ? (
        <p className="rounded-xl border border-forest-900/10 bg-white/50 p-6 text-center text-sm text-forest-700/60 dark:bg-white/[0.03]">
          Очередь пуста. Создать черновик: <code>/пост &lt;тема&gt;</code> у{" "}
          <span className="font-medium">@rightway_assistant_bot</span>.
        </p>
      ) : (
        <>
          <Section title="На согласовании" pairs={byStatus("draft")} />
          <Section title="Согласованы · ждут запуска" pairs={byStatus("scheduled")} />
          <Section title="Отклонены" pairs={byStatus("rejected")} />
          <Section title="Опубликованы" pairs={byStatus("published")} />
        </>
      )}
    </div>
  );
}
