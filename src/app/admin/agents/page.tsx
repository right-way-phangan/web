import type { Metadata } from "next";
import {
  getAgentTasks,
  getCouncilSessions,
  type DbAgentTask,
  type DbCouncilSession,
} from "@/lib/data/agent-tasks";
import { markTaskDone, reopenTask, deleteAgentTask, askCouncil } from "@/lib/actions/agent-tasks";
import { CouncilAutoRefresh } from "@/components/admin/council-autorefresh";

export const metadata: Metadata = {
  title: "Агенты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SOURCE_META: Record<string, { icon: string; label: string }> = {
  voice: { icon: "🎤", label: "голос" },
  text: { icon: "⌨️", label: "текст" },
  council: { icon: "🧠", label: "из совета" },
  advice: { icon: "💬", label: "совет" },
  task: { icon: "📝", label: "задача" },
  web: { icon: "🌐", label: "из веба" },
};

const SESSION_STATUS: Record<string, { label: string; cls: string } | null> = {
  done: null,
  pending: { label: "⏳ в очереди", cls: "bg-brass-500/15 text-brass-600" },
  processing: { label: "🧠 Зевс думает…", cls: "bg-brass-500/20 text-brass-700 animate-pulse" },
  error: { label: "⚠️ ошибка", cls: "bg-red-500/10 text-red-700/80" },
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function srcChip(source: string) {
  const m = SOURCE_META[source] ?? { icon: "·", label: source };
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/5 px-2 py-0.5 text-[11px] font-medium text-forest-900/50">
      {m.icon} {m.label}
    </span>
  );
}

function TaskRow({ task }: { task: DbAgentTask }) {
  const done = task.status === "done";
  return (
    <div
      className={
        "flex items-start gap-3 rounded-xl border border-forest-900/10 bg-white p-3 " +
        (done ? "opacity-60" : "")
      }
    >
      <div className="min-w-0 flex-1">
        <p className={"text-sm text-forest-900 " + (done ? "line-through" : "")}>{task.text}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-forest-900/40">
          {srcChip(task.source)}
          <span>{fmt(task.createdAt)}</span>
          <span className="text-forest-900/25">#{task.id}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {done ? (
          <form action={reopenTask.bind(null, task.id)}>
            <button
              type="submit"
              title="Вернуть в открытые"
              className="rounded-full border border-forest-900/15 px-2.5 py-1 text-xs text-forest-900/60 transition hover:bg-forest-900/5"
            >
              ↩
            </button>
          </form>
        ) : (
          <form action={markTaskDone.bind(null, task.id)}>
            <button
              type="submit"
              title="Отметить выполненной"
              className="rounded-full bg-forest-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-forest-900/85"
            >
              ✓ Готово
            </button>
          </form>
        )}
        <form action={deleteAgentTask.bind(null, task.id)}>
          <button
            type="submit"
            title="Удалить"
            className="rounded-full border border-red-500/20 px-2.5 py-1 text-xs text-red-700/70 transition hover:bg-red-500/10"
          >
            ✖
          </button>
        </form>
      </div>
    </div>
  );
}

function SessionMeta({ s }: { s: DbCouncilSession }) {
  const st = SESSION_STATUS[s.status];
  return (
    <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-forest-900/40">
      {srcChip(s.source)}
      {st ? (
        <span className={"rounded-full px-2 py-0.5 font-medium " + st.cls}>{st.label}</span>
      ) : null}
      <span>{fmt(s.createdAt)}</span>
      <span className="text-forest-900/25">#{s.id}</span>
    </span>
  );
}

function SessionRow({ s }: { s: DbCouncilSession }) {
  // Готов / ошибка — раскрываемая карточка с ответом; в очереди / думает — без тела.
  if (s.status === "pending" || s.status === "processing") {
    return (
      <div className="rounded-xl border border-forest-900/10 bg-white p-3">
        <p className="text-sm font-medium text-forest-900">{s.question}</p>
        <SessionMeta s={s} />
      </div>
    );
  }
  const body = s.status === "error" ? s.errorText || "Не удалось получить совет." : s.answer;
  return (
    <details className="group rounded-xl border border-forest-900/10 bg-white p-3">
      <summary className="flex cursor-pointer items-start gap-2 text-sm text-forest-900 marker:content-['']">
        <span className="mt-0.5 text-forest-900/30 transition group-open:rotate-90">▸</span>
        <span className="min-w-0 flex-1">
          <span className="font-medium">{s.question}</span>
          <SessionMeta s={s} />
        </span>
      </summary>
      <div
        className={
          "mt-3 whitespace-pre-wrap border-t border-forest-900/10 pt-3 text-sm leading-relaxed " +
          (s.status === "error" ? "text-red-700/80" : "text-forest-900/75")
        }
      >
        {body}
      </div>
    </details>
  );
}

export default async function AdminAgentsPage() {
  const [tasks, sessions] = await Promise.all([getAgentTasks(), getCouncilSessions(30)]);
  const open = tasks.filter((t) => t.status === "open");
  const doneAll = tasks.filter((t) => t.status === "done");
  const done = doneAll.slice(0, 20);
  const hasActiveSessions = sessions.some(
    (s) => s.status === "pending" || s.status === "processing",
  );

  return (
    <section className="px-4 py-8 md:px-8">

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">Агенты</h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
          Задачи и история советов ИИ-команды. <b>Совет можно спросить прямо отсюда</b> (форма
          справа) — Зевс соберёт пантеон на Max и вернёт ответ через ~1–2 мин. Задачи ставишь в
          Telegram (@rightway_assistant_bot): голосом, текстом <code>/задача</code> или кнопкой
          «Разбить на задачи» под советом.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Задачи */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-forest-900/45">
            Задачи <span className="text-forest-900/30">· открытых {open.length}</span>
          </h2>
          {open.length === 0 ? (
            <div className="rounded-xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-center text-sm text-forest-900/50">
              Открытых задач нет. Поставь голосом или <code>/задача текст</code> в боте.
            </div>
          ) : (
            <div className="space-y-2">
              {open.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-forest-900/35">
                Выполненные · {doneAll.length > done.length ? `${done.length} из ${doneAll.length}` : done.length}
              </h3>
              <div className="space-y-2">
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Совет: спросить прямо отсюда + история */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-forest-900/45">
            Спросить совет <span className="text-forest-900/30">· пантеон Зевса</span>
          </h2>
          <form
            action={askCouncil}
            className="mb-6 rounded-xl border border-forest-900/15 bg-cream-50 p-3"
          >
            <textarea
              name="question"
              rows={2}
              required
              placeholder="Напр.: Стоит ли сейчас потратить 3000 THB на буст поста в FB?"
              className="w-full resize-y rounded-lg border border-forest-900/15 bg-white p-2 text-sm text-forest-900 outline-none placeholder:text-forest-900/35 focus:border-brass-500/50"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-forest-900/40">
                Зевс соберёт совет на Max — ответ через ~1–2 мин, появится здесь и придёт в Telegram.
              </span>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-forest-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-forest-900/85"
              >
                🧠 Спросить
              </button>
            </div>
          </form>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-900/35">
            История · {sessions.length}
          </h3>
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-center text-sm text-forest-900/50">
              Пока пусто. Задай вопрос выше или <code>/совет вопрос</code> в боте.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <SessionRow key={s.id} s={s} />
              ))}
            </div>
          )}
          {/* Пока есть pending/processing — страница мягко сама обновляется */}
          <CouncilAutoRefresh active={hasActiveSessions} />
        </div>
      </div>
    </section>
  );
}
