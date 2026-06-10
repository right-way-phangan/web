import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * AI answer-engine crawlers we explicitly welcome. The wildcard rule below
 * already allows them, but listing them by name is a durable statement of
 * intent: we WANT to be read and cited by ChatGPT, Perplexity, Gemini, Claude,
 * etc. (GEO/AEO strategy). If a future default ever flips to blocking AI bots,
 * these explicit allows keep us discoverable.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const disallow = ["/api/", "/admin"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
