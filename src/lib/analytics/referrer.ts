/**
 * Classify a referrer hostname into a coarse marketing channel — so the lead
 * attribution and the referrals counter can MEASURE the GEO/AEO bet ("found via
 * an AI assistant") as a number, distinct from plain organic search/social.
 */

const AI_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)perplexity\.ai$/i, "ai:perplexity"],
  [/(^|\.)chatgpt\.com$/i, "ai:chatgpt"],
  [/(^|\.)chat\.openai\.com$/i, "ai:chatgpt"],
  [/(^|\.)openai\.com$/i, "ai:chatgpt"],
  [/(^|\.)gemini\.google\.com$/i, "ai:gemini"],
  [/(^|\.)bard\.google\.com$/i, "ai:gemini"],
  [/(^|\.)claude\.ai$/i, "ai:claude"],
  [/(^|\.)copilot\.microsoft\.com$/i, "ai:copilot"],
  [/(^|\.)bing\.com\/chat/i, "ai:copilot"],
  [/(^|\.)you\.com$/i, "ai:you"],
  [/(^|\.)phind\.com$/i, "ai:phind"],
  [/(^|\.)poe\.com$/i, "ai:poe"],
];

const SEARCH_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)google\./i, "search:google"],
  [/(^|\.)bing\.com$/i, "search:bing"],
  [/(^|\.)duckduckgo\.com$/i, "search:duckduckgo"],
  [/(^|\.)yandex\./i, "search:yandex"],
  [/(^|\.)ecosia\.org$/i, "search:ecosia"],
];

const SOCIAL_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)t\.me$/i, "social:telegram"],
  [/(^|\.)telegram\./i, "social:telegram"],
  [/(^|\.)facebook\.com$/i, "social:facebook"],
  [/(^|\.)m\.facebook\.com$/i, "social:facebook"],
  [/(^|\.)l\.facebook\.com$/i, "social:facebook"],
  [/(^|\.)instagram\.com$/i, "social:instagram"],
  [/(^|\.)youtube\.com$/i, "social:youtube"],
  [/(^|\.)youtu\.be$/i, "social:youtube"],
  [/(^|\.)linkedin\.com$/i, "social:linkedin"],
  [/(^|\.)reddit\.com$/i, "social:reddit"],
];

/**
 * Map a referrer hostname → channel token (e.g. "ai:perplexity",
 * "search:google", "social:telegram", or "ref:<host>"). Returns null for an
 * empty/own-site referrer — caller treats that as "direct".
 */
export function classifyReferrer(hostname: string | null | undefined): string | null {
  const h = (hostname ?? "").trim().toLowerCase();
  if (!h) return null;
  for (const [re, label] of AI_HOSTS) if (re.test(h)) return label;
  for (const [re, label] of SEARCH_HOSTS) if (re.test(h)) return label;
  for (const [re, label] of SOCIAL_HOSTS) if (re.test(h)) return label;
  return `ref:${h.replace(/^www\./, "")}`;
}

/** True for any AI-assistant channel token. */
export function isAiChannel(token: string | null | undefined): boolean {
  return Boolean(token && token.startsWith("ai:"));
}
