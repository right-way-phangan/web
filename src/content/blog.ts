/**
 * Blog posts for /blog. Same typed-content approach as the knowledge base
 * (no MDX runtime, no extra deps) — each post is a `KbBlock[]` body rendered by
 * <ArticleBody>. Editorial rules match the rest of the site: educational tone,
 * no prices, no client-segment narrowing (public-copy-no-prices).
 *
 * Where the knowledge base is reference material (ownership, zoning), the blog
 * is funnel/SEO content: practical, opinionated, and linked through to listings,
 * the calculator, and insights.
 */

import type { KbBlock } from "@/content/knowledge-base";

export interface BlogPost {
  slug: string;
  title: string;
  /** One-line summary — list card + meta description. */
  excerpt: string;
  /** Category chip. */
  topic: string;
  /** ISO date "2026-06-07". */
  published: string;
  /** Reading time in minutes (rough). */
  readMins: number;
  body: KbBlock[];
  takeaways?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "buying-land-koh-phangan-checks-that-matter",
    title: "Buying land on Koh Phangan: the checks that actually matter",
    excerpt:
      "Most land problems on Phangan come down to a handful of things — title, access, zoning, and who really owns it. Here's what we verify before we'd let a client sign.",
    topic: "Buying guide",
    published: "2026-06-07",
    readMins: 6,
    body: [
      "Phangan land looks simple from a listing photo: a green slope, a sea view, a price. The risk is never in the photo — it's in the paperwork, the access, and the zoning behind it. A plot that checks out is a great asset; one that doesn't can be impossible to build on or resell. The difference is due diligence, and it's the same short list every time.",
      { h: "1. The title document" },
      "Not all Thai land titles are equal. **Chanote (Nor Sor 4 Jor)** is the gold standard — fully surveyed, GPS-marked, freely transferable. Lesser documents (Nor Sor 3 Gor, Sor Kor 1) carry weaker rights and fuzzier boundaries. The first question on any plot is which document it holds, and whether it can be upgraded.",
      { h: "2. Who actually owns it" },
      "The name on the title and the person selling you the land are not always the same. We confirm ownership directly at the Land Office, check for mortgages or encumbrances registered against the title, and make sure no inheritance or co-ownership disputes are sitting in the background.",
      { h: "3. Legal access" },
      "A plot with no registered right of way is a plot you can't reliably reach — or get a building permit for. \"There's a road\" is not the same as \"there's a registered access right.\" We trace the access from the public road to the boundary and confirm it's legally secured, not just currently convenient.",
      { h: "4. The building zone" },
      "Phangan's 2025 zoning rules cap what you can build, how tall, and how much of the plot you can cover — and they vary sharply by area. A sea-view plot in a low-density zone may allow far less than the listing implies. Zoning is checked against the official maps before, not after, an offer.",
      { h: "5. It isn't a nominee structure in disguise" },
      "Since the enforcement push against nominee arrangements, a plot wrapped in a Thai company that quietly holds land for a foreigner is a liability, not a shortcut. We make sure any structure on offer is one that actually survives scrutiny — typically a registered lease plus building ownership, not a paper company. See our explainer on [how foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      "None of this is exotic — it's a checklist. But it's a checklist that has to be run on every plot, by someone who reads Thai title documents for a living. That verification is part of how we work on a deal, not a paid extra.",
    ],
    takeaways: [
      "Confirm the title type first — Chanote is strongest; lesser documents carry weaker rights.",
      "Verify ownership and access at the Land Office, not from the listing.",
      "Check the building zone against official maps before making an offer.",
      "Avoid nominee structures — favour a registered lease plus building ownership.",
    ],
  },
  {
    slug: "what-a-villa-earns-on-phangan",
    title: "What does a villa earn on Phangan? What the rental data says",
    excerpt:
      "We track nightly rates across the island so you don't have to guess. Here's how location, a pool, and a sea view move the numbers — and how to think about payback.",
    topic: "Investment",
    published: "2026-06-07",
    readMins: 5,
    body: [
      "\"What will it rent for?\" is the question behind most villa purchases here — and the one most often answered with a hopeful guess. It doesn't have to be. We track a live snapshot of nightly rates and occupancy across Phangan, and the patterns are consistent enough to plan around.",
      { h: "Location sets the floor" },
      "Nightly rates cluster by district, and the gap between the strongest and the quietest areas is large. West-coast sunset districts and the established tourist beaches command a clear premium; quieter inland and east-coast spots earn less per night but often cost far less to buy. The right question isn't \"which district earns most\" — it's \"which district earns most relative to what the land costs.\" Our [market insights](/insights) break the nightly medians down by district.",
      { h: "A pool is the single biggest lever" },
      "Across the listings we track, a private pool is the feature that moves the nightly rate most — it's close to a requirement at the upper end of the market, not a nice-to-have. If a villa is being built or renovated for rental, the pool usually pays for itself faster than any other single upgrade.",
      { h: "Sea view adds, but costs more to buy" },
      "A sea view lifts the nightly rate too — but sea-view land carries its own premium, so the yield math is tighter than it looks. Sometimes a well-designed pool villa on cheaper inland land out-earns a pricier sea-view plot on a return basis. That's exactly the kind of trade-off worth modelling before you buy.",
      { h: "Think in payback, not just nightly rate" },
      "A high nightly rate with low occupancy can lose to a modest rate that books all year. What matters is effective annual income — rate times realistic occupancy — against total cost in. You can run your own numbers on our [ROI calculator](/calculator) using the district rent presets straight from the data.",
      "The headline: rental returns on Phangan are real and plannable, but they reward configuration and location choices made deliberately. Guessing is the expensive part.",
    ],
    takeaways: [
      "Nightly rates cluster by district — judge them against land cost, not in isolation.",
      "A private pool is the biggest single lever on nightly rate.",
      "Sea view lifts rates but raises the buy-in; model the yield, don't assume it.",
      "Plan on effective annual income (rate × occupancy), not headline nightly rate.",
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Newest first — the order posts are listed in. */
export function sortedBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
}
