import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  getAgentTasks,
  getCouncilSessions,
  type DbAgentTask,
  type DbCouncilSession,
} from "@/lib/data/agent-tasks";
import { markTaskDone, reopenTask, deleteAgentTask } from "@/lib/actions/agent-tasks";

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

function SessionRow({ s }: { s: DbCouncilSession }) {
  return (
    <details className="group rounded-xl border border-forest-900/10 bg-white p-3">
      <summary className="flex cursor-pointer items-start gap-2 text-sm text-forest-900 marker:content-['']">
        <span className="mt-0.5 text-forest-900/30 transition group-open:rotate-90">▸</span>
        <span className="min-w-0 flex-1">
          <span className="font-medium">{s.question}</span>
          <span className="mt-1 flex items-center gap-2 text-[11px] text-forest-900/40">
            {srcChip(s.source)}
            <span>{fmt(s.createdAt)}</span>
            <span className="text-forest-900/25">#{s.id}</span>
          </span>
        </span>
      </summary>
      <div className="mt-3 whitespace-pre-wrap border-t border-forest-900/10 pt-3 text-sm leading-relaxed text-forest-900/75">
        {s.answer}
      </div>
    </details>
  );
}

export default async function AdminAgentsPage() {
  const [tasks, sessions] = await Promise.all([getAgentTasks(), getCouncilSessions(30)]);
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done").slice(0, 20);

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="agents" />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">Агенты</h1>
        <p className="mt-2 max-w-2xl text-sm text-forest-900/60">
          Задачи и история советов ИИ-команды. Задачи ставишь в Telegram
          (@rightway_assistant_bot): голосом, текстом <code>/задача</code> или кнопкой «Разбить на
          задачи» под советом. Здесь — общий список и разбор. Команды бота: <code>/совет</code>,{" "}
          <code>/задачи</code>, <code>/советы</code>.
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
                Выполненные · {done.length}
              </h3>
              <div className="space-y-2">
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* История советов */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-forest-900/45">
            История советов <span className="text-forest-900/30">· {sessions.length}</span>
          </h2>
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-forest-900/15 bg-cream-50 p-6 text-center text-sm text-forest-900/50">
              Пока пусто. Спроси <code>/совет вопрос</code> в боте — разбор появится здесь.
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <SessionRow key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
