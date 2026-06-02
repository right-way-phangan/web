import Link from "next/link";
import type { Route } from "next";
import type { FaqBlock } from "@/content/faq";

/**
 * Inline formatter: splits text on **bold** segments and [link](href).
 * Keeps the FAQ markup minimal without pulling in a full markdown parser.
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Tokenize: alternating [link](href), **bold**, and plain text.
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

export function FaqAnswer({ blocks }: { blocks: FaqBlock[] }) {
  return (
    <div className="mt-4 space-y-4 text-base leading-relaxed text-forest-500/85">
      {blocks.map((block, i) => {
        if (typeof block === "string") {
          return (
            <p key={i} className="max-w-prose">
              {renderInline(block)}
            </p>
          );
        }

        if ("ul" in block) {
          return (
            <ul key={i} className="max-w-prose list-disc space-y-2 pl-5 marker:text-forest-500/40">
              {block.ul.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if ("table" in block) {
          return (
            <div key={i} className="overflow-x-auto">
              <table className="my-2 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-forest-500/15 text-left">
                    {block.table.headers.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 font-medium text-forest-500/70"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.table.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx === block.table.rows.length - 1
                          ? "border-t border-forest-500/15 font-medium text-forest-900"
                          : "border-b border-forest-500/5"
                      }
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {block.table.note ? (
                <p className="mt-3 text-xs text-forest-500/60">
                  {renderInline(block.table.note)}
                </p>
              ) : null}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
