/**
 * Parsers for the developer-project textarea custom fields. Each field is a
 * plain multiline string entered in amoCRM; these turn them into structured
 * data for the landing. Pure (no server-only) so both mapper and components
 * can import. All return undefined for empty/blank input so sections that
 * render "only if present" stay clean.
 */

const lines = (raw?: string): string[] =>
  (raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/**
 * "a | b" → [a, b] (trimmed). Splits on the first unambiguous separator —
 * pipe, full-width pipe, tab, or a spaced em/en-dash. Deliberately excludes
 * bare ":" and "-" so values that contain a time ("10:00") or a hyphenated
 * range don't mis-split. Falls back to the whole line as the first cell.
 */
function splitPair(line: string): [string, string] {
  const m = line.match(/\s*[|｜\t]\s*|\s+[—–]\s+/);
  if (m?.index == null) return [line.trim(), ""];
  return [line.slice(0, m.index).trim(), line.slice(m.index + m[0].length).trim()];
}

/** One URL per line. */
export function parseUrls(raw?: string): string[] | undefined {
  const urls = lines(raw).filter((l) => /^https?:\/\//i.test(l));
  return urls.length ? urls : undefined;
}

export function parsePairs<K extends string, V extends string>(
  raw: string | undefined,
  keyName: K,
  valueName: V,
): Array<Record<K | V, string>> | undefined {
  const rows = lines(raw).map((l) => {
    const [a, b] = splitPair(l);
    return { [keyName]: a, [valueName]: b } as Record<K | V, string>;
  });
  return rows.length ? rows : undefined;
}

export const parsePriceStages = (raw?: string) => parsePairs(raw, "label", "value");
export const parseTimeline = (raw?: string) => parsePairs(raw, "date", "event");
export const parseTeam = (raw?: string) => parsePairs(raw, "role", "name");

export type VideoEmbed =
  | { kind: "youtube" | "vimeo"; src: string; href: string }
  | { kind: "file"; src: string; href: string }
  | { kind: "link"; src: string; href: string };

/** Resolve a video URL to an embeddable form (YouTube / Vimeo / mp4 / plain link). */
export function videoEmbed(url: string): VideoEmbed {
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) {
    return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${yt[1]}`, href: url };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return { kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}`, href: url };
  }
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) {
    return { kind: "file", src: url, href: url };
  }
  return { kind: "link", src: url, href: url };
}
