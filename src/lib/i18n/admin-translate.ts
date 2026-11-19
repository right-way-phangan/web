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
export function translateUi(text: string, lang: AdminLang): string {
  if (lang === "ru" || !CYR.test(text)) return text;
  const idx = lang === "en" ? 0 : 1;
  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  const core = text.trim().replace(/\s+/g, " ");
  const hit = ADMIN_DICT[core];
  if (hit) return lead + hit[idx] + trail;
  const m = EDGE.exec(core);
  if (m && m[2] && ADMIN_DICT[m[2]]) return lead + m[1] + ADMIN_DICT[m[2]][idx] + m[3] + trail;
  return text;
}
