/**
 * Project titles from the catalogue carry the format in brackets —
 * "Verana Villas (1-3BR Pool Villas)". As one H1 the bracket wrapped mid-word
 * on phones ("(1-" / "3BR Pool Villas)"). Split once so the name is the
 * headline and the bracket a subtitle. Titles without a trailing bracket
 * pass through unchanged.
 */
export function splitProjectTitle(title: string): { name: string; spec?: string } {
  const m = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(title.trim());
  if (!m) return { name: title.trim() };
  return { name: m[1], spec: m[2].trim() };
}
