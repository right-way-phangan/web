import { ADMIN_DICT } from "./admin-dict";

export type AdminLang = "ru" | "en" | "th";

const CYR = /[А-Яа-яЁё]/;
/** Decoration around a phrase that the dictionary keys don't carry: emoji, arrows, bullets, punctuation. */
const EDGE = /^([\s\p{Extended_Pictographic}️←→↗⇩☀☑★✓✕✎•·:+\-–—()]*)(.*?)([\s:·…,.()]*)$/u;

/**
 * Translate one UI string (text node or attribute) for an agent. Unknown strings
 * (user data: names, notes) come back untouched — only dictionary hits change.
 * Pure: unit-tested without a DOM.
 */
const MONTHS: Record<string, readonly [string, string]> = {
  "янв": ["Jan", "ม.ค."], "февр": ["Feb", "ก.พ."], "мар": ["Mar", "มี.ค."], "апр": ["Apr", "เม.ย."],
  "мая": ["May", "พ.ค."], "июн": ["Jun", "มิ.ย."], "июл": ["Jul", "ก.ค."], "авг": ["Aug", "ส.ค."],
  "сент": ["Sep", "ก.ย."], "окт": ["Oct", "ต.ค."], "нояб": ["Nov", "พ.ย."], "дек": ["Dec", "ธ.ค."],
};

/** Phrases with numbers / ids inside: [pattern, en, th] ($1… = captured groups). */
const PATTERNS: Array<readonly [RegExp, string, string]> = [
  [/^Выделить (RW-[\w-]+)$/, "Select $1", "เลือก $1"],
  [/^(\d+) мес$/, "$1 mo", "$1 เดือน"],
  [/^(\d+) дн$/, "$1 d", "$1 วัน"],
  [/^(\d+) открытых задач$/, "$1 open tasks", "งานค้าง $1"],
  [/^Показать пустые стадии \((\d+)\)$/, "Show empty stages ($1)", "แสดงขั้นตอนที่ว่าง ($1)"],
  [/^📋 Скопировать (\d+) телефон\(ов\)$/, "📋 Copy $1 phone(s)", "📋 คัดลอกเบอร์โทร $1 เบอร์"],
  [/^Касание < (\d+) дн$/, "Contact < $1 d", "ติดต่อภายใน $1 วัน"],
];

function fill(tpl: string, m: RegExpExecArray): string {
  return tpl.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? "");
}

export function translateUi(text: string, lang: AdminLang): string {
  if (lang === "ru") return text;
  const idx = lang === "en" ? 0 : 1;
  // Latin UI strings (stage / pipeline names from the DB: Incoming, Land…): exact match only,
  // so English user data inside longer text is never touched.
  if (!CYR.test(text)) {
    const hit = ADMIN_DICT[text.trim()];
    return hit && hit[idx] !== text.trim() ? text.replace(text.trim(), hit[idx]) : text;
  }
  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  const core = text.trim().replace(/\s+/g, " ");
  const hit = ADMIN_DICT[core];
  if (hit) return lead + hit[idx] + trail;
  const m = EDGE.exec(core);
  if (m && m[2] && ADMIN_DICT[m[2]]) return lead + m[1] + ADMIN_DICT[m[2]][idx] + m[3] + trail;
  for (const [re, en, th] of PATTERNS) {
    const pm = re.exec(core);
    if (pm) return lead + fill(lang === "en" ? en : th, pm) + trail;
  }
  // Dates: «20 нояб. · 10:00»
  const dm = /^(\d{1,2}) ([а-я]+)\.?(.*)$/.exec(core);
  if (dm && MONTHS[dm[2]]) return lead + dm[1] + " " + MONTHS[dm[2]][idx] + dm[3] + trail;
  // «Раздел · Right Way Phangan», «в базе · …»: translate each segment separately.
  if (core.includes(" · ")) {
    const parts = core.split(" · ");
    const out = parts.map((p) => translateUi(p, lang));
    if (out.some((p, i) => p !== parts[i])) return lead + out.join(" · ") + trail;
  }
  return text;
}
