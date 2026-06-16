import type { FaqBlock, FaqItem } from "@/content/faq";
import { jsonLdHtml } from "@/lib/seo/json-ld";

/**
 * FAQPage structured data. Each Q&A becomes a Question/acceptedAnswer pair so
 * search engines and AI answer engines (Google AI Overviews, Perplexity,
 * ChatGPT search) can lift our answers directly and cite the page. Answers are
 * flattened to plain text — schema.org Answer.text wants prose, not markup.
 */
export function FaqJsonLd({ items }: { items: readonly FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answerToText(item.answer),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
    />
  );
}

/** Strip markdown bold + links so only human-readable text remains. */
function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function blockToText(block: FaqBlock): string {
  if (typeof block === "string") return stripInline(block);
  if ("ul" in block) return block.ul.map(stripInline).join(" ");
  const { headers, rows } = block.table;
  return [headers.join(" — "), ...rows.map((r) => r.join(": "))].join(". ");
}

function answerToText(answer: FaqBlock[]): string {
  return answer
    .map(blockToText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
