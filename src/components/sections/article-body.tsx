import Link from "next/link";
import type { Route } from "next";
import type { KbBlock } from "@/content/knowledge-base";

/**
 * Inline formatter: splits text on **bold** segments and [label](href).
 * Mirrors the FAQ inline renderer — keeps article markup minimal without a
 * full markdown parser.
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)/g;
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const token = m[0];
    if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        parts.push(
          <Link
            key={`l-${key++}`}
            href={href as Route}
            className="text-forest-500 underline-offset-4 hover:underline hover:text-brass-500"
          >
            {label}
          </Link>,
        );
      }
    } else {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-forest-900">
          {token.slice(2, -2)}
        </strong>,
      );
    }
    last = idx + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function ArticleBody({ blocks }: { blocks: KbBlock[] }) {
  return (
    <div className="max-w-prose space-y-5 text-base leading-relaxed text-forest-500/85 md:text-lg">
      {blocks.map((block, i) => {
        if (typeof block === "string") {
          return <p key={i}>{renderInline(block)}</p>;
        }
        if ("h" in block) {
          return (
            <h2
              key={i}
              className="pt-4 font-serif text-2xl text-forest-900 md:text-3xl"
            >
              {block.h}
            </h2>
          );
        }
        if ("ul" in block) {
          return (
            <ul
              key={i}
              className="list-disc space-y-2.5 pl-5 marker:text-forest-500/40"
            >
              {block.ul.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </div>
  );
}