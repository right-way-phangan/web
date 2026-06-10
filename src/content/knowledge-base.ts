/**
 * Public knowledge-base articles for /knowledge.
 *
 * These are the site-facing (EN) renderings of selected entries from the
 * internal markdown library at project root `knowledge-base/entries/*.md`.
 * Only entries marked `public: true` are surfaced here. The `kbId` field links
 * each article back to its library source of truth.
 *
 * Phase 4 scaffold: hand-authored EN copy for the two reviewed public entries
 * (kb-0002 ownership, kb-0003 zoning). Later phases automate library → page.
 *
 * Editorial rules: educational tone, no prices, no client-segment narrowing
 * (public-copy-no-prices). Legal disclaimer is rendered at page level.
 */

import type { FaqCategoryId } from "@/content/faq";

export type KbBlock =
  | string // paragraph (supports **bold** and [label](href))
  | { h: string } // subheading
  | { ul: string[] }; // bullet list

export interface KbSource {
  title: string;
  url?: string;
}

export interface KbArticle {
  slug: string;
  kbId: string;
  topic: string;
  title: string;
  short: string;
  updated: string; // ISO date, e.g. "2026-06-03"
  body: KbBlock[];
  takeaways: string[];
  sources: KbSource[];
  faqHref?: string;
  /** FAQ category this article feeds — drives the auto-derived FAQ entry. */
  faqCategory?: FaqCategoryId;
  /** Question text for the auto-derived FAQ entry (see content/faq-derived.ts). */
  faqQuestion?: string;
}

export const KB_ARTICLES: KbArticle[] = [
  {
    slug: "how-foreigners-own-a-villa",
    kbId: "kb-0002",
    topic: "Ownership",
    title: "How foreigners legally own a villa on Koh Phangan",
    short:
      "A foreigner can't own land in Thailand — but can own the building. The compliant structure is a 30-year registered land lease, ownership of the house itself, and a registered superficies.",
    updated: "2026-06-03",
    body: [
      "Foreigners cannot own land in Thailand. They can, however, own a building — a house is legally separate from the land it stands on. That distinction is the foundation of every compliant villa purchase on Koh Phangan.",
      "After the recent enforcement against nominee structures, the clean and increasingly standard way to hold a villa is a combination of three registered rights — not a Thai company that quietly holds the land on your behalf.",
      { h: "The clean structure" },
      {
        ul: [
          "**Lease of the land** — a 30-year lease registered at the Land Office. Anything longer than three years must be registered, otherwise only the first three years are enforceable.",
          "**Ownership of the building** — the villa itself is put in your name through the construction permit or a sale-of-structure agreement. A foreigner can own the building outright.",
          "**Superficies (สิทธิเหนือพื้นดิน)** — a registered right to own your structure on someone else's land. It anchors ownership of the building independently of the lease. A usufruct is an alternative in some cases.",
        ],
      },
      { h: "What due diligence must cover" },
      "The single most misunderstood point is renewal. A 30-year lease is solid; the “30 + 30 + 30” you'll hear quoted is a contractual promise, not a property right. Whether those renewals survive a sale of the land, a change of owner, or the death of the landlord has to be checked — not assumed.",
      "Beyond renewal, the essentials are: the exact lease term and that it is actually registered; who really owns the land; any mortgages or encumbrances; access rights to the road; and confirmation the deal isn't a leasehold wrapper over a hidden nominee freehold.",
    ],
    takeaways: [
      "A lease over 3 years is only enforceable if registered at the Land Office.",
      "“30-year renewals” are contractual promises, not guaranteed rights — verify they survive a change of landowner.",
      "You own the building and lease the land — keep both rights registered and separate.",
      "Make sure the structure isn't a disguised nominee freehold.",
    ],
    sources: [
      { title: "Thai land law — Land Code and Civil & Commercial Code (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "How is a foreigner's villa ownership actually structured?",
  },
  {
    slug: "koh-phangan-building-zones",
    kbId: "kb-0003",
    topic: "Zoning & construction",
    title: "Building zones on Koh Phangan: the 2025 environmental rules",
    short:
      "Since May 2025, Koh Samui, Phangan and Tao fall under seven environmental protection zones that govern what you can build — beachfront setbacks, hillside limits, height caps.",
    updated: "2026-06-03",
    body: [
      "Since 30 May 2025, Koh Samui, Koh Phangan and Koh Tao are governed by an environmental protection regulation that sets out seven zones. If you're buying land to build — or buying a villa you may extend — these rules decide what's actually possible on the plot.",
      "Importantly, the regulation is about physical construction and environmental compliance. It does **not** restrict company registration or business licensing — only what can be built, and where.",
      { h: "The seven zones, in plain terms" },
      {
        ul: [
          "**Coastline / beachfront** — hotel size limits, setbacks and wastewater treatment. Within roughly 50 m of the water, only small single-storey buildings.",
          "**Hillside, 80 m elevation and above** — single houses only, up to 6 m height, 50% green space; no land subdivision or resort-style retaining walls.",
          "**High elevation above 140 m** — stricter still: around a 90 m² footprint and 70% open space.",
          "**Small islands and islets** — building capped near 75 m², or construction prohibited on the most sensitive ones.",
        ],
      },
      { h: "Why it matters before you buy" },
      "Two otherwise similar plots can have very different build potential depending on elevation and distance from the shore. A buyer who checks the zone before falling in love with the view avoids the classic mistake — paying for land you can't build the villa you wanted on.",
    ],
    takeaways: [
      "The rules govern construction, not company setup.",
      "Check the plot's elevation and distance from the shore before buying to build.",
      "Hillside (80 m+) and beachfront plots carry the tightest limits.",
    ],
    sources: [
      {
        title: "Sukhothai Inter Law — New zoning law for Koh Samui, Phangan & Tao (May 2025)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
      {
        title: "Bangkok Post — Islands get ecozone protection",
        url: "https://www.bangkokpost.com/thailand/politics/416989/islands-get-ecozone-protection",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "What am I allowed to build on a plot on Koh Phangan?",
  },
  {
    slug: "leasehold-vs-freehold",
    kbId: "kb-0001",
    topic: "Ownership",
    title: "Leasehold vs freehold on Koh Phangan: what foreign buyers should know in 2026",
    short:
      "Foreigners can't hold land freehold in their own name, and the company workaround turned risky after the 2025–2026 nominee enforcement. For most foreign buyers on Phangan today the clean, durable route is leasehold: a registered long lease on the land plus outright ownership of the building.",
    updated: "2026-06-10",
    body: [
      "For a foreign buyer on Koh Phangan, the practical answer in 2026 is leasehold. Foreigners cannot own land freehold in their own name in Thailand, and the structure that used to get around that — a Thai company holding the land — has become risky after the 2025–2026 enforcement against nominee shareholders. The clean route that survives scrutiny is a registered long lease on the land combined with outright ownership of the building.",
      { h: "What the two words actually mean here" },
      "“Freehold” and “leasehold” describe what you hold, not just how long you hold it.",
      {
        ul: [
          "**Freehold** — owning the land outright, in perpetuity. In Thailand this is reserved for Thai nationals (and certain Thai-majority entities). A foreigner cannot register freehold land in their own name.",
          "**Leasehold** — a registered right to use the land for a fixed term, most commonly 30 years. You don't own the land, but you can own the house on it. Paired with a superficies, the building stays yours independently of the lease.",
        ],
      },
      { h: "Why freehold through a company became risky" },
      "The common workaround was a Thai company in which a foreigner held 49% and Thai shareholders the rest — often nominees holding their shares on the foreigner's behalf. Through 2025 and into 2026, enforcement on Koh Phangan tightened sharply against exactly this arrangement.",
      "The Department of Business Development began demanding fuller information on shareholders and directors and scrutinising addresses with five or more registered companies — a classic nominee-address signal. The stated focus is small and mid-sized foreign investors. The practical result: selling freehold land into the foreign market has become very hard, because the structure most foreign buyers relied on is now the one under the microscope.",
      { h: "Why leasehold is the clean route" },
      "A registered lease doesn't pretend a foreigner owns land they legally can't. It gives you a real, registrable interest in the land for the term, while the villa itself is owned outright through the construction permit or a sale-of-structure agreement and anchored by a superficies. We cover the mechanics in [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      "The point people miss is renewal. A 30-year lease is solid; the “30 + 30 + 30” you'll hear quoted is a contractual promise, not a property right — whether it survives a sale of the land or the death of the landlord has to be checked, not assumed.",
      { h: "What due diligence must check" },
      "Whether a plot is offered as freehold or leasehold, the checks are the same in spirit: confirm what you're actually buying and that it will hold up.",
      {
        ul: [
          "Is a “freehold” offer in fact a disguised nominee structure — and is the selling company sitting on an address shared by many other companies?",
          "Is the lease registered at the Land Office, for the exact term stated? Anything over three years is only enforceable if registered.",
          "Do renewal promises survive a change of landowner, and who actually owns the land today?",
          "Mortgages, encumbrances, and registered road access.",
        ],
      },
    ],
    takeaways: [
      "Foreigners can't register freehold land in their own name — that's reserved for Thai nationals.",
      "The 49/51 company route turned risky after the 2025–2026 nominee enforcement on Phangan.",
      "Leasehold (registered land lease + owning the building via superficies) is the clean, durable route today.",
      "“30 + 30 + 30” renewals are contractual promises, not guaranteed rights — verify they survive a change of landowner.",
      "Due diligence should confirm a “freehold” offer isn't a hidden nominee scheme.",
    ],
    sources: [
      {
        title:
          "Thai Examiner — Koh Phangan crackdown continues as government targets small-time investors (25 Nov 2025)",
        url: "https://www.thaiexaminer.com/thai-news-foreigners/2025/11/25/koh-phangan-crackdown-continues-as-thai-government-sends-message-small-time-investors-are-not-wanted/",
      },
      { title: "Thai land law — Land Code and Civil & Commercial Code (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "ownership",
    faqQuestion: "Should a foreigner buy freehold or leasehold on Koh Phangan?",
  },
  {
    slug: "land-titles-chanote-vs-nor-sor-3",
    kbId: "kb-0005",
    topic: "Documents",
    title: "Land titles on Koh Phangan: Chanote vs Nor Sor 3, and how to verify one",
    short:
      "The title class decides what you're actually buying. A Chanote is the full ownership deed and the one to aim for; Nor Sor 3 Gor is usually fine with care. Por Bor Tor 5 and Sor Por Kor land are not real titles — common island traps. Verify every deed at the Land Office before you commit.",
    updated: "2026-06-10",
    body: [
      "On Koh Phangan, the single most important document in any land deal is the title deed — and not all titles are equal. The class of title decides whether you're buying real, transferable ownership or a piece of paper that can't be legally sold at all. Here's how they rank, and what due diligence has to confirm.",
      { h: "The title classes, strongest to weakest" },
      {
        ul: [
          "**Chanote (Nor Sor 4 Jor, โฉนดที่ดิน)** — the full ownership title deed. GPS-surveyed with concrete boundary markers; can be sold, mortgaged and subdivided. The gold standard — this is what to aim for.",
          "**Nor Sor 3 Gor (น.ส.3ก)** — a certificate of use with an aerial parcel map. Transferable, and can be upgraded to a Chanote. Boundaries are defined but without marked posts; transfer doesn't need a public notice. Usually fine with proper checks.",
          "**Nor Sor 3 (น.ส.3)** — older, with vaguer boundaries and no parcel-map link. Transfer requires a 30-day public posting. Workable, but needs more caution.",
          "**Sor Kor 1 (สค.1)** — an old notification of possession, not a title; registration has been effectively closed since 2008. Weak.",
          "**Por Bor Tor 5 / 6 (ภบท.5)** — **not a title at all** — it's a land-tax payment receipt, often over state or forest land. It cannot be legally owned or transferred. A classic island trap, marketed cheaply as “land with possession.” Avoid.",
          "**Sor Por Kor 4-01 (สปก.)** — agricultural land-reform land, reserved for qualified Thai farmers. It can't be sold to others or used to build a villa. Avoid.",
        ],
      },
      { h: "How to verify a title" },
      "A title deed is only as good as what the Land Office record says about it. Verification means reading the official record, not trusting the seller's copy.",
      {
        ul: [
          "Compare the original deed against the Land Office's record copy at the Koh Phangan Land Office. The back of the deed logs everything registered against it: ownership history, mortgages, leases, usufructs, servitudes and court orders.",
          "Commission a GPS boundary survey by a licensed surveyor and walk the plot — confirm the posts match the deed.",
          "Confirm registered road access. Landlocked plots are common, and a right of way has to be registered, not just verbal.",
          "Check what you can build. A clean title tells you what you own; the 2025 environmental zoning tells you what's buildable — see [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
          "Make sure it isn't forest reserve, Sor Por Kor, or encroached state land — and for a leasehold, that the lease is registered on the back of the deed.",
        ],
      },
      { h: "Phangan in particular" },
      "A lot of island land is held as Nor Sor 3 Gor rather than Chanote — that's normal here, not a red flag in itself. The real traps are Por Bor Tor 5 “possession” land sold as if it were ownership, and beachfront or hillside plots that carry a clean title but are effectively unbuildable under the ecozone rules. Both look fine until you check.",
    ],
    takeaways: [
      "Chanote is the full ownership deed and the title to aim for; Nor Sor 3 Gor is usually fine with proper due diligence.",
      "Por Bor Tor 5 (ภบท.5) is a tax receipt, not a title — it can't be legally owned or transferred.",
      "Sor Por Kor (สปก.) land is for Thai farmers only — you can't build a villa on it.",
      "Always compare the deed against the Land Office record — the back of the deed lists every mortgage, lease and claim.",
      "A clean title still doesn't guarantee you can build — check the 2025 ecozone rules separately.",
    ],
    sources: [
      { title: "Thai Land Code — title deed classes (Chanote / Nor Sor 3 Gor / Nor Sor 3 / Sor Kor 1), general practice" },
      { title: "Por Bor Tor 5 is a tax-payment document, not a title; Sor Por Kor is agricultural land-reform land (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "documents",
    faqQuestion: "What land titles exist on Koh Phangan, and which can I safely buy?",
  },
  {
    slug: "how-land-is-priced-price-per-rai",
    kbId: "kb-0006",
    topic: "Market",
    title: "How land is priced on Koh Phangan: the rai, and what moves the price",
    short:
      "Land here is sold by the rai (1,600 m²), but the price per rai on its own tells you very little. Sea view, road access, title class and whether you can actually build under the 2025 zoning move the number far more than the headline figure. Live medians by district are on our market page.",
    updated: "2026-06-10",
    body: [
      "Land on Koh Phangan is measured and sold by the rai, and you'll see prices quoted as a figure “per rai.” That figure is a starting point, not an answer — two plots at the same price per rai can be worth wildly different amounts once you look at what actually drives value here.",
      { h: "The unit: rai, ngan, talang wah" },
      "Thai land area uses a few units it pays to know before you compare anything.",
      {
        ul: [
          "**1 rai = 1,600 m²** — the headline unit land is priced in.",
          "**1 ngan = 400 m²** — a quarter of a rai.",
          "**1 talang wah (sq. wah) = 4 m²** — 400 to a rai. Small premium plots are sometimes quoted per talang wah.",
        ],
      },
      { h: "What actually moves the price per rai" },
      "The same nominal price can sit on plots that aren't remotely comparable. The big drivers:",
      {
        ul: [
          "**District** — the west coast (Sri Thanu, Haad Yao and the wellness belt) carries a premium over quieter inland and northern areas.",
          "**Sea view and slope** — a sea view and a gentle, buildable gradient add a lot; a steep plot costs more to build on, which pulls land value the other way.",
          "**Proximity to the beach** — beachfront and near-beach plots are their own tier.",
          "**Road access** — a registered right of way versus a landlocked plot is one of the largest swings of all. See [Land titles and how to verify one](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Title class** — Chanote versus Nor Sor 3 Gor matters, and cheap “Por Bor Tor 5” land usually isn't ownership at all, so it can't be compared on price.",
          "**Whether you can build** — under the 2025 environmental zoning, a plot you can't build on is worth a fraction of one you can. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
          "**Utilities and usable shape** — mains water and power, road quality, and how much of the plot is actually usable after setbacks and gradient.",
        ],
      },
      { h: "Freehold and leasehold are priced differently" },
      "A freehold plot is quoted as a capital price per rai. Leasehold isn't a single per-rai price at all — it's a lease: an up-front prepayment or periodic payments over the term, usually with indexation built in. Since the post-2025 shift toward leasehold (see [Leasehold vs freehold](/knowledge/leasehold-vs-freehold)), comparing a leasehold offer to a freehold one means comparing a stream of payments to a one-time price, not two numbers per rai.",
      { h: "So how do you know if a price is fair?" },
      "Start from comparable plots — same district, similar access, view and title — not from a single per-rai headline. For current median land prices per rai by district, drawn from live inventory, see our [market insights](/insights). Then the only way to know what a specific plot is worth is to check the things above against the deed and the zoning.",
    ],
    takeaways: [
      "Land is sold by the rai (1,600 m²); 1 ngan = 400 m², 1 talang wah = 4 m².",
      "Price per rai alone is misleading — view, access, title class and buildability move it far more.",
      "A landlocked plot or one you can't build on under the 2025 zoning is worth a fraction of a comparable buildable one.",
      "Freehold is a capital price per rai; leasehold is a lease (prepayment + term + indexation) — they aren't directly comparable per rai.",
      "Compare like-for-like plots; live median prices per rai by district are on the market-insights page.",
    ],
    sources: [
      { title: "Thai land area units — 1 rai = 1,600 m² = 4 ngan = 400 talang wah (general practice)" },
      { title: "Right Way market insights — median land price per rai by district (/insights)" },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "How is land priced on Koh Phangan, and what makes one plot cost more than another?",
  },
];

export function getKbArticleBySlug(slug: string): KbArticle | undefined {
  return KB_ARTICLES.find((a) => a.slug === slug);
}