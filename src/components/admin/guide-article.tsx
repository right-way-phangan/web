import Link from "next/link";
import type { Route } from "next";
import { GuideChecklist } from "@/components/admin/guide-checklist";
import { GuideQuiz } from "@/components/admin/guide-quiz";
import { GuideOnboardingProgress } from "@/components/admin/guide-onboarding-progress";
import type { GuideLiveData } from "@/lib/data/guide";

/**
 * Markdown-рендерер внутреннего справочника (/admin/guide). Расширенный
 * subset относительно блогового ArticleBody — регламентам нужны таблицы,
 * нумерованные шаги, колл-ауты и код:
 *   ## / ###          → h2 / h3 (с якорями)
 *   - / 1.            → ul / ol
 *   | a | b |         → таблица (вторая строка — разделитель)
 *   > текст           → колл-аут (⚠️/🔴 — красный, остальное — латунный)
 *   ``` … ```         → блок кода
 *   ---               → разделитель
 *   **b** `c` [t](href) → инлайн
 */

// ─── Инлайн: **bold**, `code`, [label](href) ───

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(`[^`]+`)/g;
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const token = m[0];
    if (token.startsWith("[")) {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (lm) {
        const [, label, href] = lm;
        const external = /^https?:\/\//.test(href);
        parts.push(
          external ? (
            <a
              key={`l-${key++}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-forest-500 underline-offset-4 hover:text-brass-500 hover:underline"
            >
              {label}
            </a>
          ) : (
            <Link
              key={`l-${key++}`}
              href={href as Route}
              className="font-medium text-forest-500 underline-offset-4 hover:text-brass-500 hover:underline"
            >
              {label}
            </Link>
          ),
        );
      }
    } else if (token.startsWith("**")) {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-forest-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={`c-${key++}`}
          className="rounded bg-forest-900/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-forest-900"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = idx + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Якорь заголовка — синхронизирован с guideHeadingId в lib/data/guide.ts
// (TOC ссылается на эти же id).
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Блоки ───

type Block =
  | { kind: "h2" | "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "tasklist"; items: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "code"; lines: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "quiz" }
  | { kind: "onboarding-progress" }
  | { kind: "live"; name: "stages" | "admin-sections" | "stats" }
  | { kind: "hr" };

function splitRow(line: string): string[] {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    if (t.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++; // закрывающие ```
      blocks.push({ kind: "code", lines: code });
      continue;
    }
    const h = /^(#{2,6})\s+(.*)$/.exec(t);
    if (h) {
      blocks.push({ kind: h[1].length === 2 ? "h2" : "h3", text: h[2].trim() });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }
    // Маркер встраивания квиза самопроверки (страница «Проверь себя»).
    if (t === "{{quiz}}") {
      blocks.push({ kind: "quiz" });
      i++;
      continue;
    }
    // Сводный прогресс онбординга (агрегирует чек-листы страницы).
    if (t === "{{onboarding-progress}}") {
      blocks.push({ kind: "onboarding-progress" });
      i++;
      continue;
    }
    // Живые данные: маркер подставляет актуальное состояние системы.
    const liveM = /^\{\{(stages|admin-sections|stats)\}\}$/.exec(t);
    if (liveM) {
      blocks.push({ kind: "live", name: liveM[1] as "stages" | "admin-sections" | "stats" });
      i++;
      continue;
    }
    if (t.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ kind: "quote", lines: quote.filter(Boolean) });
      continue;
    }
    if (t.startsWith("|") && i + 1 < lines.length && /^\|[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
      const header = splitRow(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()));
        i++;
      }
      blocks.push({ kind: "table", header, rows });
      continue;
    }
    const isUl = (s: string) => /^[-*]\s+/.test(s);
    const isOl = (s: string) => /^\d+[.)]\s+/.test(s);
    if (isUl(t) || isOl(t)) {
      const ordered = isOl(t);
      const items: string[] = [];
      while (i < lines.length) {
        const it = lines[i].trim();
        if (ordered ? !isOl(it) : !isUl(it)) break;
        items.push(it.replace(ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/, ""));
        i++;
      }
      // Чек-лист: маркированный список, где каждый пункт начинается с `[ ]`/`[x]`
      // → интерактивные чекбоксы с сохранением прогресса (онбординг агента).
      const TASK = /^\[[ xX]\]\s+/;
      if (!ordered && items.length > 0 && items.every((it) => TASK.test(it))) {
        blocks.push({ kind: "tasklist", items: items.map((it) => it.replace(TASK, "").trim()) });
        continue;
      }
      blocks.push({ kind: ordered ? "ol" : "ul", items });
      continue;
    }
    // Параграф — до пустой строки или начала другого блока
    const para: string[] = [];
    while (i < lines.length) {
      const pt = lines[i].trim();
      if (
        !pt ||
        pt.startsWith("#") ||
        pt.startsWith(">") ||
        pt.startsWith("|") ||
        pt.startsWith("```") ||
        isUl(pt) ||
        isOl(pt) ||
        /^(-{3,}|\*{3,})$/.test(pt)
      )
        break;
      para.push(pt);
      i++;
    }
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
  }
  return blocks;
}

// ─── Рендер ───

/** Рендер live-маркера. Данных нет (источник недоступен) — короткий fallback. */
function LiveBlock({ name, live }: { name: "stages" | "admin-sections" | "stats"; live?: GuideLiveData }) {
  const wrap = "rounded-xl border border-forest-900/10 bg-forest-50/40 p-4";
  const tag = (
    <span className="mb-2 inline-block rounded bg-forest-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest-500">
      ● актуально из системы
    </span>
  );
  if (name === "stages") {
    const pipes = live?.stages ?? [];
    if (pipes.length === 0)
      return <p className="text-sm text-forest-900/50">Стадии воронок подгружаются из CRM.</p>;
    return (
      <div className={wrap}>
        {tag}
        <div className="space-y-3">
          {pipes.map((p) => (
            <div key={p.pipeline}>
              <p className="text-sm font-semibold text-forest-900">{p.pipeline}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-forest-900/70">
                {p.stages.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="text-forest-900/30">→</span>}
                    <span className="rounded-full bg-cream-50 px-2 py-0.5 ring-1 ring-forest-900/10">{s}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (name === "admin-sections") {
    const secs = live?.adminSections ?? [];
    if (secs.length === 0)
      return <p className="text-sm text-forest-900/50">Разделы админки подгружаются.</p>;
    return (
      <div className={wrap}>
        {tag}
        <ul className="flex flex-wrap gap-2">
          {secs.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href as Route}
                className="inline-block rounded-full bg-cream-50 px-3 py-1 text-sm text-forest-900/80 ring-1 ring-forest-900/10 hover:text-brass-600"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  // stats
  const st = live?.stats;
  if (!st) return <p className="text-sm text-forest-900/50">Счётчики подгружаются.</p>;
  return (
    <div className={wrap}>
      {tag}
      <div className="flex gap-6">
        <div>
          <p className="font-serif text-2xl text-forest-900">{st.objects}</p>
          <p className="text-xs text-forest-900/55">объектов в каталоге</p>
        </div>
        <div>
          <p className="font-serif text-2xl text-forest-900">{st.leads}</p>
          <p className="text-xs text-forest-900/55">лидов в CRM</p>
        </div>
      </div>
    </div>
  );
}

export function GuideArticle({
  md,
  slug,
  live,
}: {
  md: string;
  slug: string;
  live?: GuideLiveData;
}) {
  const blocks = parseBlocks(md);
  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-forest-900/80">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h2":
            return (
              <h2
                key={i}
                id={headingId(b.text)}
                className="scroll-mt-24 pt-6 font-serif text-2xl text-forest-900 first:pt-0"
              >
                {renderInline(b.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                id={headingId(b.text)}
                className="scroll-mt-24 pt-3 text-base font-semibold text-forest-900"
              >
                {renderInline(b.text)}
              </h3>
            );
          case "p":
            return <p key={i}>{renderInline(b.text)}</p>;
          case "ul":
            return (
              <ul key={i} className="space-y-1.5 pl-5">
                {b.items.map((it, j) => (
                  <li key={j} className="list-disc marker:text-brass-500">
                    {renderInline(it)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-1.5 pl-5">
                {b.items.map((it, j) => (
                  <li key={j} className="list-decimal marker:font-semibold marker:text-brass-500">
                    {renderInline(it)}
                  </li>
                ))}
              </ol>
            );
          case "tasklist":
            return <GuideChecklist key={i} items={b.items} storageKey={`${slug}:${i}`} />;
          case "quiz":
            return <GuideQuiz key={i} />;
          case "onboarding-progress":
            return <GuideOnboardingProgress key={i} />;
          case "live":
            return <LiveBlock key={i} name={b.name} live={live} />;
          case "quote": {
            const text = b.lines.join(" ");
            const alarm = /^[⚠🔴❗]/u.test(text);
            return (
              <div
                key={i}
                className={
                  "rounded-xl border-l-4 px-4 py-3 text-sm " +
                  (alarm
                    ? "border-red-600/60 bg-red-50 text-red-900"
                    : "border-brass-500/60 bg-brass-500/[0.07] text-forest-900/85")
                }
              >
                {b.lines.map((l, j) => (
                  <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                    {renderInline(l)}
                  </p>
                ))}
              </div>
            );
          }
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl bg-panel px-4 py-3 font-mono text-[13px] leading-relaxed text-panel-fg"
              >
                {b.lines.join("\n")}
              </pre>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-forest-900/15 text-left">
                      {b.header.map((c, j) => (
                        <th key={j} className="py-2 pr-4 font-semibold text-forest-900">
                          {renderInline(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j} className="border-b border-forest-900/[0.07] align-top">
                        {row.map((c, k) => (
                          <td key={k} className="py-2 pr-4">
                            {renderInline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "hr":
            return <hr key={i} className="border-forest-900/10" />;
        }
      })}
    </div>
  );
}
