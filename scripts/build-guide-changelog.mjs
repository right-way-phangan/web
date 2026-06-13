#!/usr/bin/env node
/**
 * Авто-лента «Что нового» для справочника (/admin/guide).
 *
 * Собирает записи из git-истории: ищет в commit-сообщениях трейлер
 *   Guide: <slug|—> | <текст для команды>
 * и пишет их в src/content/guide/_changelog.generated.json. getGuideChangelog()
 * мержит этот файл с ручным _changelog.md (дедуп по date+text).
 *
 * Запускается перед `next build` (см. package.json "build"). git недоступен
 * (или history урезана) — пишем пустой массив, лента деградирует к ручной.
 * Никаких авто-коммитов: артефакт пересобирается на каждом деплое.
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src/content/guide/_changelog.generated.json");
const REC = "\x1e"; // разделитель записей (ASCII record separator)
const FLD = "\x1f"; // разделитель полей (ASCII unit separator)

function gitLog() {
  try {
    // committer-date (ISO) + полное тело коммита; последние 400 коммитов
    return execSync("git log -n 400 --no-merges --pretty=format:%cI%x1f%B%x1e", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function parse(raw) {
  const entries = [];
  const seen = new Set();
  for (const rec of raw.split(REC)) {
    const sep = rec.indexOf(FLD);
    if (sep === -1) continue;
    const iso = rec.slice(0, sep).trim();
    const body = rec.slice(sep + 1);
    if (!iso || !body) continue;
    const date = iso.slice(0, 10);
    for (const line of body.split("\n")) {
      // «Guide: <slug|—> | текст» либо просто «Guide: текст»
      const m = /^\s*Guide:\s*(.+)$/i.exec(line);
      if (!m) continue;
      let slug = null;
      let text = m[1].trim();
      const piped = /^([\w-]+|—)\s*\|\s*(.+)$/.exec(text);
      if (piped) {
        slug = piped[1] === "—" ? null : piped[1];
        text = piped[2].trim();
      }
      if (!text) continue;
      const key = `${date}|${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ date, slug, text });
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

const entries = parse(gitLog());
writeFileSync(OUT, JSON.stringify(entries, null, 2) + "\n");
console.log(`[guide-changelog] записей: ${entries.length} → ${path.relative(process.cwd(), OUT)}`);
