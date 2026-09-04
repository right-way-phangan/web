/**
 * Cap a page <title> for search results. The site template appends
 * " · Right Way Phangan" (~20 chars) and Google truncates around 60, so long
 * editorial headlines (RU knowledge guides ran to 233 chars) were cut mid-word
 * in SERPs. The H1 keeps the full headline; only the <title> is shortened, at
 * a word boundary, with an ellipsis.
 */
export function seoTitle(title: string, max = 60): string {
  const t = title.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const atWord = cut.lastIndexOf(" ");
  // Keep at least half the budget so a single long first word doesn't leave "…".
  const head = atWord >= Math.floor(max / 2) ? cut.slice(0, atWord) : cut;
  return head.replace(/[\s,:;—–-]+$/u, "") + "…";
}
