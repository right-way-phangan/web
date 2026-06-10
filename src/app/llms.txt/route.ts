import { getSiteUrl } from "@/lib/site-url";
import { siteConfig } from "@/lib/site-config";
import { DISTRICTS } from "@/content/districts";
import { KB_ARTICLES } from "@/content/knowledge-base";

export const revalidate = 3600; // 1 hour — keep in step with the catalog

/**
 * /llms.txt — the emerging convention (llmstxt.org) for handing LLMs a clean,
 * curated map of the site. Answer engines (ChatGPT, Perplexity, Claude) can read
 * this single markdown file to understand who we are and which pages to ground on,
 * instead of guessing from raw HTML. Part of the GEO/AEO strategy.
 */
export async function GET(): Promise<Response> {
  const base = getSiteUrl();

  const corePages: Array<[string, string, string]> = [
    ["Listings", "/listings", "Curated land, villas, and houses currently for sale on Koh Phangan."],
    ["Districts", "/districts", "Area-by-area guide to Koh Phangan: character, who each area suits, what to expect."],
    ["Services", "/services", "What Right Way does: buying and selling land, villas, and houses with end-to-end deal support."],
    ["Process", "/process", "The step-by-step buying journey: search, due diligence, contract, funds transfer, registration."],
    ["FAQ", "/faq", "Answers to the questions foreign buyers actually ask: Chanote vs NS3, freehold vs leasehold, company structures, taxes, due diligence."],
    ["Knowledge base", "/knowledge", "In-depth, reviewed guides on owning and buying property in Thailand as a foreigner."],
    ["Calculator", "/calculator", "ROI / rental-yield calculator for Koh Phangan property."],
    ["Insights", "/insights", "Market analysis and data on the Koh Phangan property and rental market."],
    ["About", "/about", "Who Right Way is and how we work."],
    ["Contact", "/contact", "How to reach Right Way."],
  ];

  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push("");
  lines.push(
    `> ${siteConfig.name} is a specialised real estate agency on Koh Phangan, Thailand. ` +
      `We help foreign and local buyers purchase and sell land, villas, and houses, with a ` +
      `transparent, systemised process and AI-assisted search. Languages: English and Russian.`,
  );
  lines.push("");
  lines.push(
    `Right Way's focus areas are foreign ownership structures, leasehold vs freehold land, ` +
      `legal due diligence (Chanote/NS3 title checks, building zones), and end-to-end deal ` +
      `support on Koh Phangan. The Russian-language site lives under ${base}/ru.`,
  );
  lines.push("");

  lines.push("## Core pages");
  for (const [name, path, desc] of corePages) {
    lines.push(`- [${name}](${base}${path}): ${desc}`);
  }
  lines.push("");

  lines.push("## Guides & knowledge");
  for (const a of KB_ARTICLES) {
    lines.push(`- [${a.title}](${base}/knowledge/${a.slug}): ${a.short}`);
  }
  lines.push("");

  lines.push("## District guides");
  for (const d of DISTRICTS) {
    lines.push(`- [${d.title}](${base}/districts/${d.slug})`);
  }
  lines.push("");

  lines.push("## Contact");
  lines.push(`- Email: ${siteConfig.contact.email}`);
  // Telegram channel / WhatsApp are env-gated — some are intentionally off at this
  // stage (no WhatsApp yet, channel mid-launch). Only emit links that are live.
  if (siteConfig.contact.telegram.channel) {
    lines.push(`- Telegram: https://t.me/${siteConfig.contact.telegram.channel}`);
  }
  if (siteConfig.contact.whatsapp) {
    lines.push(`- WhatsApp: https://wa.me/${siteConfig.contact.whatsapp}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
