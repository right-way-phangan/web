/**
 * Разбор markdown справочника в блоки — чистая логика без JSX, чтобы её можно
 * было покрыть тестами (рендер живёт в components/admin/guide-article.tsx).
 */

export type Block =
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

export function splitRow(line: string): string[] {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

export function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const blockStart = i;
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
    // `#` тоже заголовок. Раньше ловились только `##`–`######`, и строка с
    // одиночной решёткой не подходила ни под один блок: ветка параграфа ниже
    // сразу ломается на `pt.startsWith("#")`, i не двигался — рендер уходил в
    // бесконечный цикл и страница не открывалась вовсе (так висел гайд match).
    // H1 показываем как h2: заголовок страницы уже нарисован сверху из фронтматтера.
    const h = /^(#{1,6})\s+(.*)$/.exec(t);
    if (h) {
      blocks.push({ kind: h[1].length <= 2 ? "h2" : "h3", text: h[2].trim() });
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
    // Страховка от зависания: если строка не подошла ни одному блоку и ни одна
    // ветка не сдвинула i, внешний цикл крутился бы на ней вечно. Такую строку
    // просто пропускаем — сломанная разметка стоит потерянной строки, но не
    // повисшей страницы.
    if (i === blockStart) i++;
  }
  return blocks;
}
