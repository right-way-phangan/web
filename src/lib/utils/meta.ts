/**
 * Turns a raw amoCRM listing description into a clean meta / OG / JSON-LD
 * description. The source text concatenates feature tags and prose with runs of
 * em-dashes ("————————") as visual dividers — those leak verbatim into social
 * previews. This collapses divider runs to a single em dash, normalises
 * whitespace, and trims to a word boundary near `maxLen` (no mid-word cuts).
 */

// Two-plus dash-like chars (em/en/figure/horizontal-bar/box/underscore) or
// three-plus hyphens — i.e. a visual divider, not a normal "4-bedroom" hyphen.
const SEPARATOR_RUN = /\s*(?:[—–―‒─_]{2,}|-{3,})\s*/g;

export function cleanMetaDescription(
  raw: string | null | undefined,
  maxLen = 160,
): string | undefined {
  if (!raw) return undefined;
  const s = raw
    .replace(SEPARATOR_RUN, " — ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return undefined;
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut;
  return trimmed.replace(/[\s—–-]+$/, "") + "…";
}
