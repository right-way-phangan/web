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
  {
    slug: "cost-of-buying-taxes-and-fees",
    kbId: "kb-0007",
    topic: "Costs",
    title: "The full cost of buying on Koh Phangan: taxes, fees and the FET form",
    short:
      "Beyond the price, a buyer budgets roughly 1–2% for legal, survey and registration. Most transfer taxes fall on the seller by law and local practice. The detail that catches people out isn't a tax at all — it's keeping the FET form you'll need to take your money back out when you sell.",
    updated: "2026-06-10",
    body: [
      "The purchase price is rarely the whole story. There are transfer taxes at the Land Office, professional fees, an annual property tax, and — the part people forget — a single bank form that decides whether you can repatriate your money when you eventually sell. Here's the full picture. Transfer taxes are calculated on the Land Office's appraised value, which is usually below market.",
      { h: "Transfer taxes and fees at the Land Office" },
      {
        ul: [
          "**Transfer fee — 2%** of the appraised value. Often split between buyer and seller by local practice.",
          "**Specific Business Tax (SBT) — 3.3%**, paid by the seller, if the property was held under 5 years. Waived after 5 years.",
          "**Stamp duty — 0.5%**, but only when SBT doesn't apply.",
          "**Withholding tax** — for an individual seller, a progressive rate based on appraised value and years held; for a company, 1% of the higher of appraised or sale price. A seller's tax.",
          "**For a leasehold**, registering the lease costs **1%** of the total rent over the term, plus **0.1%** stamp duty.",
        ],
      },
      { h: "Who pays what" },
      "On Phangan, standard practice is that the seller pays the agent commission — a foreign buyer typically pays zero commission on a listed property. Our own published structure is on the [Services page](/services).",
      "What the buyer does budget for is roughly 1–2% of the price, covering legal due diligence, the contract and transfer handling, a GPS boundary survey, translation and notarisation, and — for a villa — a structural inspection.",
      { h: "Annual property tax" },
      "Under the Land and Building Tax Act (2019), an owner-occupied home is taxed at **0.02–0.10%** of appraised value per year. Vacant or rented residential property is taxed higher (up to around 0.3%), commercial use higher still, and long-vacant land escalates over time. Right Way doesn't file taxes for clients — use a Thai accountant for compliance.",
      { h: "Getting money into Thailand — and the FET form" },
      "Funds usually move by SWIFT to the lawyer's escrow account or the seller at closing; Wise is common and cheaper on FX for smaller amounts. Receive into a major Thai bank (Bangkok Bank, Kasikorn, SCB).",
      "The detail that matters most: keep the **Foreign Exchange Transaction (FET) form** the receiving Thai bank issues when foreign currency arrives from abroad. You will need it to remit the proceeds back out of Thailand when you sell. Without it, repatriating your money is much harder.",
      { h: "What you'll pay when you sell" },
      "When you sell, the seller side typically carries the SBT (3.3% if held under 5 years, waived after), withholding tax (1% of appraised value), personal income tax on the gain (progressive, with deductions after 5 years), and the transfer fee (2%, often split). A Thai company selling pays corporate income tax (20% on profit) instead of personal income tax.",
    ],
    takeaways: [
      "Budget roughly 1–2% of the price for the buyer side (legal, survey, registration).",
      "Most transfer taxes — SBT, withholding, much of the transfer fee — fall on the seller by law and practice.",
      "On Phangan the seller pays the agent commission; buyers usually pay none on listed properties.",
      "Keep the FET form — it's what lets you take your money back out of Thailand when you sell.",
      "Annual Land and Building Tax on an owner-occupied home is 0.02–0.10% of appraised value.",
    ],
    sources: [
      { title: "Thai property transfer taxes — transfer fee 2%, SBT 3.3%, stamp duty 0.5%, withholding tax (general practice)" },
      { title: "Land and Building Tax Act 2019 — residential 0.02–0.10% of appraised value per year" },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion: "What are the total costs and taxes of buying property on Koh Phangan?",
  },
  {
    slug: "how-to-buy-property-step-by-step",
    kbId: "kb-0008",
    topic: "Process",
    title: "How to buy property on Koh Phangan: the step-by-step process",
    short:
      "From brief to registration, a clean purchase runs through nine steps — and the two that actually protect you are independent legal due diligence and registering the lease at the Land Office. With a clear title, expect roughly 4–8 weeks from reservation to completion.",
    updated: "2026-06-10",
    body: [
      "Buying property on Koh Phangan as a foreigner isn't complicated once you know the order of operations. The steps below are the path a clean purchase follows. Two of them — independent legal due diligence and registering the lease — are non-negotiable; skip them and you don't really own what you paid for.",
      { h: "The nine steps" },
      {
        ul: [
          "**1. Settle the structure.** For a foreigner that almost always means leasehold: a registered land lease plus owning the building. Start here so everything after fits. See [Leasehold vs freehold](/knowledge/leasehold-vs-freehold).",
          "**2. Brief and search.** Define the goal (home, investment, development), the area and the must-haves, then shortlist. Land prices vary far more than the headline per-rai figure — see [How land is priced](/knowledge/how-land-is-priced-price-per-rai).",
          "**3. Viewing trip.** See the plots in person — road access, utilities, the actual view and gradient. Photos hide a lot.",
          "**4. Reservation.** A reservation agreement plus a deposit takes the property off the market. The deposit is normally refundable if due diligence later fails.",
          "**5. Legal due diligence.** The deed checked against the Land Office record, encumbrances, access, and what you can build under the 2025 zoning. See [Land titles](/knowledge/land-titles-chanote-vs-nor-sor-3) and [Building zones](/knowledge/koh-phangan-building-zones).",
          "**6. Contracts.** A registered land lease, a sale of the building, and a registered superficies — drafted and reviewed before you sign.",
          "**7. Transfer the funds.** By SWIFT or Wise to the lawyer's escrow. Keep the FET form — you'll need it to take proceeds back out when you sell. See [Costs, taxes and the FET form](/knowledge/cost-of-buying-taxes-and-fees).",
          "**8. Register at the Land Office.** The lease is registered on the back of the deed and the building transferred; transfer taxes and fees are paid at this point.",
          "**9. Post-deal.** Switch utilities into your name, store the originals safely, and set up tax compliance with a Thai accountant.",
        ],
      },
      { h: "How long it takes" },
      "With a clear title, expect roughly 4–8 weeks from reservation to registration. It runs longer when due diligence surfaces something — an unregistered access road, a lease that was never registered, or a zoning limit on what you can build. That's due diligence doing its job, not a delay to rush past.",
      { h: "The two steps that actually protect you" },
      "Everything here matters, but two steps are what stand between you and a bad deal: independent legal due diligence (step 5) and registering the lease at the Land Office (step 8). A handshake, an unregistered lease, or a “we'll sort the paperwork later” is not ownership. Insist on both.",
    ],
    takeaways: [
      "Nine steps: structure → brief → viewing → reservation → due diligence → contracts → funds → registration → post-deal.",
      "Independent legal due diligence and a registered lease are the two non-negotiable steps.",
      "Keep the FET form from your bank transfer — it's needed to repatriate funds when you sell.",
      "With a clear title, budget roughly 4–8 weeks from reservation to completion.",
      "A reservation deposit is normally refundable if due diligence fails.",
    ],
    sources: [
      { title: "Thai conveyancing practice — lease registration, building transfer, Land Office completion (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "process",
    faqQuestion: "What are the steps to buy property on Koh Phangan as a foreigner?",
  },
  {
    slug: "buying-off-plan-new-developments",
    kbId: "kb-0009",
    topic: "Process",
    title: "Buying off-plan on Koh Phangan: the upside, the risks, and how to vet a developer",
    short:
      "Off-plan can mean a lower entry price, staged payments and a choice of unit — but you're buying a promise, not a finished building. The protection is in the details: a developer with a real track record, the land title under the project, the permits, staged payments tied to construction, and a contract your own lawyer has read.",
    updated: "2026-06-10",
    body: [
      "Buying off-plan means buying from the developer before or during construction. On Koh Phangan that's how most new villa and condo projects are sold. The appeal is real — but so are the risks, and the difference between a good off-plan buy and a bad one is almost entirely in the due diligence.",
      { h: "Why people buy off-plan" },
      "A lower entry price than a finished unit, payments spread over the build rather than all at once, first pick of the best units, and the chance of appreciation by the time it completes. For the right project and buyer, that's a strong combination.",
      { h: "What you're actually taking on" },
      "You're buying a promise of a finished building, which adds risks a completed property doesn't carry: construction delay or non-completion, a developer running out of money, the finished spec not matching the renders, and — underneath it all — the same foreign-ownership reality. The unit is still held as leasehold plus ownership of the structure (see [Leasehold vs freehold](/knowledge/leasehold-vs-freehold)), and the project still sits on a piece of land with its own title.",
      { h: "Off-plan due diligence — beyond the usual checks" },
      {
        ul: [
          "**The developer's track record** — projects they've actually finished and handed over, not just renders and a brochure.",
          "**The land title under the project** — what the development is built on, checked the same way as any plot. See [Land titles](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Building permit and zoning** — that the project is legally permitted at this location and scale under the 2025 environmental rules. See [Building zones](/knowledge/koh-phangan-building-zones).",
          "**Your unit's legal structure** — exactly how the lease and building ownership are registered to you on completion.",
          "**A staged payment schedule** tied to construction milestones — not the full price up front — and what happens to your money if the developer fails (escrow, guarantees).",
          "**The contract** — completion date, penalties for delay, the handover and snagging process, and precisely what the spec includes.",
        ],
      },
      { h: "On Koh Phangan specifically" },
      "The island's new-build market is small, with relatively few large developers, so a track record is easier to verify — and more important when it's thin. The 2025 environmental zoning also constrains what can be built where, so confirming a project's permits is not a formality here; it's central. A beautiful render means nothing if the project can't legally be completed as drawn.",
      { h: "How to keep the risk down" },
      "Pay in stages against real construction progress rather than a large amount up front, use escrow where it's available, favour a developer who has completed comparable projects, and have an independent lawyer review the contract before you sign anything. The overall journey is the same as any purchase — see [the step-by-step buying process](/knowledge/how-to-buy-property-step-by-step).",
    ],
    takeaways: [
      "Off-plan offers a lower entry price, staged payments and unit choice — at the cost of construction and developer risk.",
      "Vet the developer's completed track record, not the renders.",
      "Check the land title under the project and that it's permitted under the 2025 zoning.",
      "Tie payments to construction milestones; avoid paying the full price up front.",
      "Have an independent lawyer review the contract — completion date, penalties, handover.",
    ],
    sources: [
      { title: "Thai off-plan practice — staged payments, developer due diligence, permits and handover (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "process",
    faqQuestion: "Is buying off-plan on Koh Phangan safe, and how do I vet the developer?",
  },
  {
    slug: "renting-out-your-villa-rules-and-taxes",
    kbId: "kb-0010",
    topic: "Renting out",
    title: "Renting out your Koh Phangan villa: the 30-day rule, taxes and realistic yield",
    short:
      "Renting out for under 30 days is treated as running a hotel and needs a licence — without one, daily lettings are technically illegal. Monthly lets are generally fine. Rental income is taxed, and the only honest way to model yield is from real nightly rates and occupancy, not a brochure number.",
    updated: "2026-06-10",
    body: [
      "Plenty of buyers plan to rent out their villa, at least part of the year. That's a sound idea — but the rules around it are widely misunderstood, and getting them wrong can turn an investment case into a liability. Here's what actually governs renting out on Koh Phangan.",
      { h: "The 30-day rule (Hotel Act)" },
      "Under Thailand's Hotel Act, renting accommodation for stays of fewer than 30 days is treated as operating a hotel — which requires a hotel licence. Without one, daily and weekly lettings (the classic Airbnb model) are technically illegal and can attract fines. Renting for 30 days or more generally falls outside the Act and is fine. Condominium units carry extra short-let restrictions under the Condominium Act and building rules.",
      "In practice, many owners on Phangan do let short-term without a licence; enforcement is uneven, but the risk is real — more so in the tighter regulatory climate since 2025. Licensing is possible for a property set up for it, and is worth considering if daily-rate income is central to your plan.",
      { h: "Tax on rental income" },
      "Rental income is taxable. Two things to budget for: the annual Land and Building Tax is charged at a higher rate on rented residential property than on an owner-occupied home (see [Costs and taxes](/knowledge/cost-of-buying-taxes-and-fees)), and income tax applies to the rent — progressive for an individual, a withholding rate for a non-resident, and corporate income tax if the property is held through a Thai company. Use a Thai accountant; Right Way doesn't file taxes for clients.",
      { h: "Modelling the yield honestly" },
      "A realistic yield is the median nightly rate times occupancy, minus the costs that always apply — management (often around 25% of gross), maintenance and the annual taxes above. A brochure “projected yield” usually skips the costs and assumes peak occupancy all year. For real nightly rates and occupancy by district, drawn from live listings, see our [market insights](/insights), then run your own numbers in the [calculator](/calculator).",
      { h: "Who runs it day to day" },
      "A rental villa needs managing — guests, cleaning, maintenance, bookings. Right Way focuses on buying and selling property, not rental management, so this typically runs through a management partner. The point to plan for: that cost is real and comes out of your gross, which is exactly why a 30%-on-paper yield isn't a 30% return.",
      { h: "The bottom line" },
      "Unless you obtain a hotel licence, build your investment case on 30-day-plus lets rather than nightly income — and verify the rental assumptions before you buy a property “for rental.” The asset you choose, and where, decides most of the outcome.",
    ],
    takeaways: [
      "Lets under 30 days need a hotel licence; without one they're technically illegal. 30-day-plus lets are generally fine.",
      "Condos carry extra short-let restrictions under the Condominium Act and building rules.",
      "Rental income is taxed, and Land and Building Tax is higher on rented residential property.",
      "Model yield as nightly rate × occupancy minus costs (management ~25%, maintenance, tax) — not a brochure figure.",
      "Right Way doesn't manage rentals — day-to-day runs through a management partner; that cost is real.",
    ],
    sources: [
      { title: "Hotel Act B.E. 2547 (2004) — stays under 30 days treated as hotel operation, licence required (general practice)" },
      { title: "Land and Building Tax Act 2019 — higher rate on rented residential property (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Can I rent out my villa on Koh Phangan short-term, and what about tax and yield?",
  },
  {
    slug: "financing-buying-as-a-foreigner",
    kbId: "kb-0011",
    topic: "Costs",
    title: "Financing a Koh Phangan purchase as a foreigner: mortgages, payment plans and cash",
    short:
      "For a foreign buyer, Thailand is largely a cash market. Thai banks generally don't lend to foreigners for a home — and never for land, which you can't own anyway. Plan around your own funds, finance at home if you need to, and use a developer's staged payments on off-plan.",
    updated: "2026-06-10",
    body: [
      "“Can I get a mortgage?” is one of the first questions foreign buyers ask, and the honest answer reshapes the whole plan: on Koh Phangan, you should expect to buy with cash. Thai bank lending to foreigners is rare and doesn't cover the things most people buy here. Here's the real picture and the ways people actually fund a purchase.",
      { h: "Thai bank mortgages" },
      "As a rule, Thai banks don't offer mortgages to foreigners for residential property, and certainly not for land — which a foreigner can't own in the first place. A few banks (UOB, ICBC, Bangkok Bank's Singapore branch) occasionally lend in foreign currency for condominium units under specific conditions, but for villas and land on Phangan that route is effectively closed. Thai permanent residents are a different case.",
      { h: "How people actually fund it" },
      {
        ul: [
          "**Cash / own funds** — the default. Most purchases here complete with the buyer's own capital.",
          "**Financing at home** — releasing equity or borrowing against property in your home country, then bringing the funds in. This is the most common form of “financing” a Thai purchase. Keep the FET form when the money arrives — see [Costs, taxes and the FET form](/knowledge/cost-of-buying-taxes-and-fees).",
          "**Developer payment plans** — for off-plan, staged payments tied to construction act as informal financing, spreading the cost over the build. See [Buying off-plan](/knowledge/buying-off-plan-new-developments).",
          "**Seller or private financing** — occasionally negotiated, but rare and to be approached carefully.",
        ],
      },
      { h: "What this means for your plan" },
      "Because a Thai mortgage usually isn't on the table, structure the purchase around cash and, for a new build, staged payments. It's also why moving funds correctly matters — the bank transfer and the FET form aren't admin to skip; they're what let you take your money back out when you eventually sell.",
    ],
    takeaways: [
      "Thailand is largely a cash market for foreign buyers — don't count on a Thai mortgage.",
      "Thai banks generally don't lend to foreigners for homes, and never for land.",
      "A few banks lend in foreign currency for condos under conditions — not for villas or land on Phangan.",
      "Most buyers fund with cash or by financing against property in their home country.",
      "Off-plan staged payments spread the cost over the build — informal financing.",
    ],
    sources: [
      { title: "Thai mortgage practice — limited foreign lending, foreigners cannot own land (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion: "Can a foreigner get a mortgage to buy property on Koh Phangan?",
  },
  {
    slug: "inheritance-leasehold-and-villa",
    kbId: "kb-0012",
    topic: "Structures",
    title: "Inheritance on Koh Phangan: what happens to your leasehold and villa when you die",
    short:
      "What your heirs receive depends on how the asset is held. A land lease, the villa building and company shares all pass on differently — and a Thai lease does not pass on automatically unless the contract says so. The fix is to plan it in advance: a succession clause in the lease, the company structure, and a Thai will.",
    updated: "2026-06-10",
    body: [
      "“What happens to all this when I die?” is a fair question, and on Koh Phangan the answer is reassuring but conditional: inheritance works — if it was set up to. The key is that a lease, a building and company shares are three different things in law, and each passes on its own way. Get the wording right when you buy, and your heirs inherit smoothly; leave it to chance, and parts of the asset can fall away.",
      { h: "By type of asset" },
      {
        ul: [
          "**Leasehold (land lease)** — a Thai lease does not pass on automatically; it's a contract, not ownership. It transfers to your heirs only if the lease itself spells out succession and renewal for them. Without that clause, the lease can end on the lessee's death. This is why the inheritance wording is checked at the buying stage — see [Leasehold vs freehold](/knowledge/leasehold-vs-freehold).",
          "**The villa / building** — a foreigner can own the structure separately from the land, and it passes as personal property under a will. But with no rights to the land beneath it, an inherited building is stranded — so the building and the lease must be inherited together.",
          "**Condominium (freehold unit)** — passes as ownership. A foreign heir usually has to fit within the building's 49% foreign quota or sell the unit within a set period.",
          "**Held through a company** — if the land or villa sits in a Thai Co., Ltd., what your heirs inherit are your shares under the will or articles; the property itself stays with the company.",
        ],
      },
      { h: "What to set up in advance" },
      {
        ul: [
          "**A Thai will** covering your Thai assets, separate from any will at home — it makes the process faster and clearer for your heirs.",
          "**A succession clause in the lease** — transfer and/or renewal to named heirs.",
          "**Aligned inheritance** of the lease, the building and any company shares, so they don't drift apart.",
        ],
      },
      { h: "The takeaway" },
      "Inheritance on Phangan is workable, but not by default — it's configured when the deal is structured, not afterwards. Before you buy, talk through with your agent and lawyer exactly how the asset will pass to your heirs.",
    ],
    takeaways: [
      "What heirs receive depends on how the asset is held — lease, building and shares pass differently.",
      "A Thai lease does NOT pass on automatically; it needs a succession clause in the contract.",
      "The villa building and the lease must be inherited together, or the building is stranded.",
      "A condo passes as ownership, subject to the 49% foreign quota for the heir.",
      "Set up a Thai will and align lease, building and shares before you buy.",
    ],
    sources: [
      { title: "Thai succession — inheritance by will under the Civil and Commercial Code; leasehold passes only if the contract provides for it (general practice)" },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "What happens to my leasehold and villa on Koh Phangan when I die?",
  },
  {
    slug: "nominee-crackdown-krabi-islands-2026",
    kbId: "kb-0013",
    topic: "Structures",
    title: "Nominee-ownership enforcement spreads to Krabi: what island buyers need to know in 2026",
    short:
      "A June 2026 raid on luxury villas in Krabi Province — linked to Spanish nationals — marks the geographic expansion of the enforcement campaign that began on Koh Phangan and Samui. With 401 businesses under investigation in Krabi and roughly 21,000 cases targeted nationwide, the crackdown is no longer an island story. Nominee structures now carry real criminal risk across all of Thailand's main tourist areas.",
    updated: "2026-06-11",
    body: [
      "On 2 June 2026, Thai police and the Department of Business Development (DBD) raided a luxury pool villa on over one rai of land in Nong Thale subdistrict, Mueang Krabi. The villa was linked to two Spanish nationals through a Thai company. The immediate charges spanned suspected nominee ownership, unlicensed short-term tourist rentals under the Hotel Act, and immigration reporting failures. The raid is now feeding into an investigation of 401 business entities across Krabi Province identified by the DBD as suspected nominee arrangements.",
      "Krabi is the latest expansion of a crackdown that began on the islands. The structure and scale are the same — and for anyone who holds property through a Thai company with nominee Thai shareholders, the geography no longer offers safety.",
      { h: "How the enforcement campaign developed" },
      {
        ul: [
          "**Koh Phangan and Koh Samui (October 2025)** — 32 companies targeted across the islands with 300+ officers; 34 companies subsequently investigated, ~20 holding assets over 100 million baht.",
          "**Koh Phangan (May 2026)** — 22 foreigners arrested, more than 40 rai seized (estimated value over 200 million baht).",
          "**Phuket (ongoing)** — 200+ suspects, billions of baht in seizures; one Thai national found listed as nominee in 87 separate companies.",
          "**Krabi (June 2026)** — 401 businesses flagged, raids begun, 6 land plots under review.",
          "**Next in scope** — Pattaya, Phang Nga, Hua Hin and Chiang Mai are explicitly named in DBD/DSI statements as coming enforcement zones.",
        ],
      },
      { h: "What law they are enforcing" },
      "The Foreign Business Act B.E. 2542 (1999) makes it a criminal offence for a Thai national to hold shares on behalf of a foreigner (Section 36) and equally criminal for the foreigner who benefits from the arrangement (Section 37). Penalties are up to **3 years imprisonment and fines of 100,000–1,000,000 baht**, or both. The Land Code adds a further consequence: a foreign-controlled company that holds land unlawfully can be ordered to sell the land within **180 days to 1 year** — at whatever price the forced sale yields.",
      { h: "What changed in 2026" },
      "Two procedural changes made the enforcement much harder to hide from. Since **January 2026**, Thai shareholders in companies with foreign involvement must submit bank statements proving they funded their shares from their own money. Since **April 2026**, any company alteration involving a foreign director triggers a mandatory review. Both changes removed the paper layer that nominee structures relied on. The DBD is now working with the Department of Special Investigation (DSI) and the Anti-Money Laundering Office (AMLO) — which means the investigation tools extend beyond company registers to financial flows.",
      { h: "What this means for buyers" },
      "For anyone considering a purchase structured through a Thai company, the enforcement context is not ambiguous: both the nominee and the foreigner face prosecution; the land, not just the company, can be subject to forced sale. The clean route is a registered leasehold — a right that doesn't require a Thai company or nominees to exist. See [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa) and [Leasehold vs freehold](/knowledge/leasehold-vs-freehold).",
      "For anyone who already holds through a company structure, the advice from Thai property lawyers is to get confidential, fact-specific legal advice before the enforcement reaches your area — not after. The wrong move made in panic can make matters worse than the structure itself.",
    ],
    takeaways: [
      "June 2026: luxury villas in Krabi raided over nominee structures — 401 businesses flagged across the province.",
      "The crackdown now spans Phangan, Samui, Phuket, Krabi, Pattaya, Hua Hin and Chiang Mai — it is explicitly nationwide.",
      "Both the Thai nominee AND the foreign beneficiary face criminal prosecution: up to 3 years, fines of 100,000–1,000,000 baht.",
      "The Land Code permits forced sale within 180 days to 1 year if a violation is found — the land itself is at risk, not only the company.",
      "Since January 2026, Thai shareholders must prove genuine investment with bank statements; since April 2026, any foreign-director company change triggers a mandatory review.",
    ],
    sources: [
      {
        title:
          "Thai Examiner — Police move to tighten the foreign ownership net now in Krabi: luxury villas linked with Spaniards raided (3 June 2026)",
        url: "https://www.thaiexaminer.com/thai-news-foreigners/2026/06/03/police-move-to-tighten-the-foreign-ownership-net-now-in-krabi-luxury-villas-linked-with-spaniards-raided/",
      },
      {
        title: "Lawyers for Expats Thailand — The Nominee Crackdown: Understanding Why It Is Happening",
        url: "https://www.lawyersforexpatsthailand.com/post/the-nominee-crackdown-understanding-why-it-is-happening",
      },
      {
        title:
          "Khaosod English — Thai Authorities Target Nominee Businesses on Koh Samui and Koh Phangan (14 October 2025)",
        url: "https://www.khaosodenglish.com/news/business/2025/10/14/thai-authorities-target-nominee-businesses-on-koh-samui-and-koh-phangan/",
      },
      {
        title:
          "Foreign Business Act B.E. 2542 (1999), Sections 36–37; Thai Land Code Sections 94, 97–98, 111–113 (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "Is a Thai nominee company still a safe way to hold property on Koh Phangan in 2026?",
  },
  {
    slug: "koh-phangan-market-outlook-2026",
    kbId: "kb-0014",
    topic: "Market",
    title: "Koh Phangan property market in 2026: what the data shows and what to watch",
    short:
      "Koh Phangan is part of a 61-billion-baht investment hub with Koh Samui, house prices have risen roughly 5–10% annually since 2016, and Colliers sees the market at a comparable stage to Phuket five years ago. The genuine signals are real — but they don't override the basics: title quality, the 2025 zoning, and buying through a clean structure are preconditions, not afterthoughts.",
    updated: "2026-06-11",
    body: [
      "The market numbers for Koh Phangan in 2026 are striking. Koh Samui and Koh Phangan together host 154 active residential projects worth a combined 61.14 billion baht, with approximately 2,860 units currently for sale (Q1 2026 data). Phangan alone accounts for 41 residential projects comprising 438 units valued at roughly 7.94 billion baht. That is not a small, informal market anymore.",
      { h: "How prices have moved" },
      {
        ul: [
          "**House prices** rose 8.9% year-on-year from July 2024 to July 2025, consistent with the historical 5–10% annual growth observed since 2016.",
          "**Western coast land** (Sri Thanu, Haad Yao and the wellness belt) is up 2–4× since early 2022 — the most dramatic appreciation on the island.",
          "**Current averages**: condominiums at around 7.9 million baht; villas at roughly 12 million baht; houses at around 15 million baht; land at an average of 20.27 million baht.",
          "Land prices remain substantially lower than comparable plots in Phuket, which is the basis of the Colliers early-growth argument.",
        ],
      },
      { h: "The Colliers view" },
      "Colliers Thailand director Phattarachai Taweewong described the current trajectory as resembling the expansion of Phuket's property market around five years ago — a period that proved to be early in a sustained price run. The comparison is based on foreign demand concentration, limited supply, and land prices still below the level a mature resort market carries. The condominium segment is where supply is most constrained relative to demand.",
      "Colliers also offered a clear-eyed warning: the success of future projects will not depend on market momentum alone. Careful verification of land title documents, strategic location selection, and suitability of the product for actual buyer demand are what separates performing assets from ones that stall.",
      { h: "Who is buying and why" },
      "The market is driven overwhelmingly by foreign buyers — particularly from Israel, Europe and Australia — seeking long-stay residences, retirement homes or rental investment properties. The digital-nomad transition Phangan underwent from 2020 onwards anchored a segment of full-time residents who buy rather than rent. Major Thai developers including Supalai and Ornsirin Holding are launching new projects in 2026 to capture a share of demand they previously left to smaller operators.",
      { h: "The rental investment case" },
      "Rental yields for villas can exceed 10% net under the right conditions. The conditions matter: the Hotel Act requires a licence for stays under 30 days, and the honest yield calculation runs from real nightly rates and occupancy minus management costs (typically ~25%), maintenance and tax — not a brochure number. See [Renting out your villa](/knowledge/renting-out-your-villa-rules-and-taxes).",
      { h: "What growth alone doesn't resolve" },
      "Market appreciation is a tailwind, not a due-diligence substitute. The 2025 environmental zoning limits what can be built on many of the plots that command a view or beachfront premium — and a plot you can't build on the way you intend is not an appreciating asset at the price you paid. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
      "The nominee crackdown also matters for the supply picture. A significant share of the freehold-structured inventory listed before 2025 was held through Thai nominee companies. Much of that supply has either been withdrawn, become unsellable in its current structure, or is under investigation. The practical market for foreign buyers is leasehold — see [Leasehold vs freehold](/knowledge/leasehold-vs-freehold). Growth signals are real; they apply to correctly structured assets on properly titled land.",
    ],
    takeaways: [
      "Q1 2026: Koh Samui and Phangan have 154 active residential projects worth 61 billion baht; Phangan alone accounts for 41 projects and 7.94 billion baht.",
      "House prices on Phangan rose 8.9% year-on-year in 2025; western coast land is up 2–4× since 2022.",
      "Colliers: the market resembles Phuket's growth trajectory from five years ago, with land prices still below Phuket levels.",
      "Market momentum alone doesn't make a deal good — title quality, buildability under the 2025 zoning, and clean ownership structure are preconditions.",
      "The nominee crackdown has thinned freehold-structured supply; the functional foreign-buyer market is leasehold.",
    ],
    sources: [
      {
        title: "Nation Thailand — Samui and Phangan boom as 61bn-baht property investment hub (2026)",
        url: "https://www.nationthailand.com/business/property/40066940",
      },
      {
        title:
          "Thailand Construction and Engineering News — Koh Samui and Koh Phangan boom as 61bn-baht property investment hub",
        url: "https://thailand-construction.com/koh-samui-and-koh-phangan-boom-as-61bn-baht-property-investment-hub/",
      },
      {
        title:
          "kohphangan.estate — Annual Housing Appreciation on Koh Phangan: Key Drivers, Market Trends & Investment Insights",
        url: "https://kohphangan.estate/blog/tpost/de0ng2hti1-annual-housing-appreciation-on-koh-phang",
      },
      {
        title: "Bangkok Post — Samui, Phangan are new property hotspots",
        url: "https://www.bangkokpost.com/property/3267488/samui-phangan-are-new-property-hotspots",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion:
      "Is now a good time to buy property on Koh Phangan, and what do the market numbers show?",
  },
  {
    slug: "due-diligence-checklist-koh-phangan",
    kbId: "kb-0015",
    topic: "Process",
    title: "Due diligence before buying on Koh Phangan: the complete checklist",
    short:
      "The due diligence stage is where you confirm you're buying what's advertised — and that it will hold up. The core check is the Land Office record on the back of the deed; from there: seller identity, encumbrances, boundaries, road access, buildability and utilities.",
    updated: "2026-06-14",
    body: [
      "Due diligence is the stage between signing a reservation and signing the real contracts. For a purchase on Koh Phangan it covers five areas: the title deed and Land Office record, the seller's identity and authority, encumbrances and registered claims, physical boundaries and road access, and buildability under the zoning rules. Shortcut any of these and you're either buying a risk or trusting a story.",
      { h: "Start at the Land Office" },
      "The back of any Chanote or Nor Sor 3 Gor deed is the most important document in the transaction. It records every ownership transfer, every registered mortgage, lease, usufruct, servitude and court order — all dated and stamped by the Land Department. Bring the deed (or its number) to the Koh Phangan Land Office and compare it against the official record copy. This is not a formality — it is the check.",
      { h: "1. Title class and condition" },
      {
        ul: [
          "Aim for **Chanote** (full GPS-surveyed ownership deed) or **Nor Sor 3 Gor** (usable with care). Por Bor Tor 5 is a tax receipt, not a title — it cannot be legally owned or transferred. Sor Por Kor land is reserved for Thai farmers. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "Hold the deed against light to verify the Garuda watermark and the Land Department officer's signature with red official stamp.",
          "Check that the deed number, plot number and province match exactly what was represented by the seller.",
          "Confirm the title has not been split, subdivided or altered since the last transfer.",
        ],
      },
      { h: "2. Seller identity and authority" },
      {
        ul: [
          "The seller's name on the deed must match their Thai national ID exactly — no exceptions.",
          "If the seller is a company, verify its registration at the Department of Business Development: that it is active, tax-compliant and not under investigation. Obtain a board resolution authorising the sale, signed by directors listed in the registration.",
          "Post-2025: if a company seller is involved, also check whether it sits on a high-density registered address — a classic indicator of nominee structures. See [Leasehold vs freehold](/knowledge/leasehold-vs-freehold).",
          "For a leasehold transfer, confirm the original lessee has the right to assign under the lease contract — if there is no assignment clause, the transfer may be blocked.",
        ],
      },
      { h: "3. Encumbrances and registered claims" },
      {
        ul: [
          "Read the back of the deed for mortgages, leases, usufructs and servitudes. These do not disappear on a sale unless expressly released before or at transfer.",
          "Request a formal encumbrance search (สารบัญจดทะเบียน) at the Land Office to get the complete current picture.",
          "Check for court seizure orders or injunctions — these are also registered on the deed and would freeze any transfer.",
          "**For a leasehold purchase specifically**: confirm the lease is registered on the back of the deed with the correct term and dates. A lease over three years that is not registered there is only enforceable for three years, regardless of what the contract says.",
        ],
      },
      { h: "4. Boundaries, survey and road access" },
      {
        ul: [
          "Walk the entire plot with a licensed surveyor and confirm the concrete boundary markers (ลูกบาน) are present, numbered and match the deed's cadastral plan.",
          "Commission a GPS boundary survey if any marker is missing, displaced or the plot shares a contested boundary with a neighbour.",
          "**Verify registered road access** — a right of way to the public road that is registered on the deed, not merely assumed or verbal. A landlocked plot with only verbal access is one of the most common traps on the island.",
          "Match the deed's stated area (in rai/ngan/talang wah) against the physical survey. Discrepancies need resolution before exchange.",
        ],
      },
      { h: "5. Buildability and the 2025 zoning rules" },
      "A clean title tells you what you own — it does not tell you what you're allowed to build. Under the 2025 environmental protection rules, Koh Phangan has seven construction zones with different height limits, setbacks and footprint maximums. Hillside (80 m+ elevation) and beachfront plots carry the tightest restrictions. Check the plot's elevation and distance from the shore against the rules before you commit. A plot you can't build the intended villa on is not the asset you priced it as. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
      { h: "6. Utilities, permits and the physical plot" },
      {
        ul: [
          "Confirm the source and reliability of water supply — government main, private well or shared tank are all common on Phangan, and reliability varies significantly.",
          "Verify electricity meter registration with the Provincial Electricity Authority.",
          "If a building already exists on the plot, check that the construction permit (Por Ror 1) exists and that the structure matches the approved plans. Unauthorised additions are common and become the buyer's problem at transfer.",
          "Ask neighbours about flooding, drainage and the dry-season road condition — photos don't capture these.",
        ],
      },
      "Independent legal due diligence is the step that separates a sound purchase from one that transfers someone else's problem to you. Use a lawyer who is not also acting for the seller or developer — that independence is the point. For where due diligence fits into the full purchase timeline, see [How to buy property on Koh Phangan step by step](/knowledge/how-to-buy-property-step-by-step).",
    ],
    takeaways: [
      "The back of the deed at the Land Office is the authoritative record — compare every seller claim against it.",
      "Seller name, plot number and area on the deed must match exactly what is represented.",
      "A registered right of way to the public road is essential — verbal access is one of the island's most common traps.",
      "A lease over three years is only enforceable if registered on the back of the deed with the correct term.",
      "A clean title doesn't guarantee buildability — verify the 2025 ecozone rules separately for the specific plot.",
    ],
    sources: [
      {
        title: "Siam Legal International — Due Diligence in Thailand",
        url: "https://www.siam-legal.com/realestate/Due-Diligence-in-Thailand.php",
      },
      {
        title: "Jirawat Law Office — Essential Due Diligence for Foreign Property Buyers in Thailand",
        url: "https://jirawatlawoffice.co.th/essential-due-diligence/",
      },
      {
        title: "Thai Land Code — title deed classes, Land Office encumbrance registration, right of way (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "process",
    faqQuestion: "What due diligence should I do before buying property on Koh Phangan?",
  },
  {
    slug: "selling-leasehold-villa-exit-liquidity",
    kbId: "kb-0016",
    topic: "Ownership",
    title: "Selling your leasehold villa on Koh Phangan: assignment, taxes and exit planning",
    short:
      "A registered leasehold can be sold — but only if the lease contract explicitly permits assignment. Taxes at exit are moderate and mostly drop after five years. The harder practical challenge is liquidity: leasehold villas on Phangan can take several months to sell, and a shorter remaining term directly compresses what a buyer will pay.",
    updated: "2026-06-14",
    body: [
      "At some point you'll want to sell. Before you do — ideally before you buy — it's worth understanding what you actually hold, how it transfers, what it costs you, and what affects how long you wait. The answers depend on how the asset is structured.",
      { h: "What you own and what you can sell" },
      "In the standard structure for a foreign buyer, you hold two things separately: the remaining term on a registered land lease, and ownership of the villa building (through the construction permit and a registered superficies). When you sell, both need to transfer to the buyer.",
      {
        ul: [
          "**The land lease** is assigned to the buyer — the buyer steps into your position as lessee for the remaining term. This only works if the lease explicitly permits assignment. Without that clause, the transfer needs the landlord's active cooperation and may effectively be blocked. Check this clause before you buy.",
          "**The building** is sold as a structure. Under a registered superficies, this can be done independently of the lease and binds future landowners — a meaningful protection for both buyer and seller.",
          "**The residual lease term** is what the buyer is paying for. A 28-year lease is worth significantly more than a 15-year one. Renewal clauses improve marketability, but they are contractual promises, not guaranteed rights — courts in Thailand have held that automatic renewal provisions are not enforceable as property rights. Don't plan an exit around renewals that haven't happened.",
        ],
      },
      { h: "Taxes when you sell" },
      "The seller side at the Land Office typically carries:",
      {
        ul: [
          "**Specific Business Tax (SBT) — 3.3%** of the higher of the appraised or sale price, if you held the property for under five years. Waived entirely after five years.",
          "**Stamp duty — 0.5%**, applying only when SBT doesn't — i.e., when you've held five years or more.",
          "**Withholding tax** — for an individual seller, calculated progressively on the Land Office's appraised value with deductions based on the number of years held. For a foreign non-resident this is withheld at the Land Office. For a company seller, 1% of the higher of appraised or sale price.",
          "**Transfer fee — 2%** of the appraised value, often split with the buyer by local practice.",
        ],
      },
      "There is no separate capital gains tax in Thailand — the withholding tax system is how gains are taxed at source. The five-year holding threshold matters: passing it eliminates the 3.3% SBT and replaces it with just 0.5% stamp duty. Consult a Thai accountant for the exact calculation; it depends on the holding period and the Land Office's appraised value, which is typically below market. For the full tax picture including what you paid on the way in, see [Costs, taxes and the FET form](/knowledge/cost-of-buying-taxes-and-fees).",
      { h: "Getting your money out: the FET form" },
      "To repatriate your sale proceeds out of Thailand, you need the original Foreign Exchange Transaction (FET) form that your Thai bank issued when you brought the purchase funds in. Present the FET form, the Land Office sale agreement and the tax receipt to your bank — they process the international wire transfer. Without the FET form, repatriation is significantly harder and some banks will refuse it outright. Keep this document from the day you buy.",
      { h: "Liquidity and time to sell" },
      "Once you have a buyer, Land Office registration takes one day. Finding the buyer is the longer part.",
      {
        ul: [
          "A leasehold villa with 25+ years remaining and a clear assignment clause is a marketable asset. One with 15 years and an assignment clause that is unclear will take considerably longer.",
          "Well-maintained, turnkey properties in well-connected locations sell faster. Western-coast and beachfront villas are more liquid than inland plots.",
          "The buyer pool is almost entirely cash buyers — very few banks will lend against a leasehold villa in Thailand — which limits the pool and means pricing needs to be realistic.",
          "Budget **3–9 months** from listing to completion for a realistically priced leasehold villa in the current market. Properties priced above market can sit for 12–18 months or longer.",
        ],
      },
      { h: "What to plan at the buying stage with exit in mind" },
      "If liquidity on exit matters — and for most buyers it should — the time to address it is when you buy:",
      {
        ul: [
          "Confirm the lease explicitly permits assignment to a third party.",
          "Ensure the building transfer mechanism (superficies) is clearly registered and separable from the lease.",
          "Verify how renewal provisions are worded — and treat them as a bonus, not a guarantee; plan around the primary term.",
          "Keep the FET form the day funds arrive.",
        ],
      },
      "The mechanics of the leasehold structure and building ownership are covered in [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa). For the full purchase process, including what to check in the contracts stage, see [How to buy property on Koh Phangan](/knowledge/how-to-buy-property-step-by-step).",
    ],
    takeaways: [
      "A leasehold can only be assigned to a buyer if the lease contract explicitly permits it — verify this clause before you buy.",
      "Holding 5+ years eliminates the 3.3% Specific Business Tax; after that only 0.5% stamp duty applies.",
      "Keep the original FET form from your purchase — it is required to repatriate proceeds when you sell.",
      "A shorter remaining lease term directly compresses what a buyer will pay; plan the exit around the primary term, not renewal promises.",
      "Budget 3–9 months to find a buyer in the current market; the pool is cash-only, which limits depth.",
    ],
    sources: [
      {
        title: "Integrity Legal — Selling, Assignment, or Sublease of Lease in Thailand",
        url: "https://www.legal.co.th/resources/thailand-real-estate-property-law/title/selling-assignment-or-sublease-lease-thailand/",
      },
      {
        title: "Siam Legal International — Transfer of Property in Thailand",
        url: "https://www.siam-legal.com/realestate/Transfer-of-Property-in-Thailand.php",
      },
      {
        title: "Esales International — How to Sell Property in Thailand: The Definitive Guide (2026)",
        url: "https://esalesinternational.com/2026/05/14/how-to-sell-property-in-thailand-the-definitive-guide-for-foreign-owners/",
      },
      {
        title: "Thai property transfer taxes — SBT 3.3%, stamp duty 0.5%, transfer fee 2%, withholding tax (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "ownership",
    faqQuestion: "How do I sell my leasehold villa on Koh Phangan, and what taxes will I pay?",
  },
  {
    slug: "land-office-registration-day",
    kbId: "kb-0017",
    topic: "Process",
    title: "A day at the Land Office: what happens when a deal is registered in Thailand",
    short:
      "The Land Office is where a deal becomes legally real. Both buyer and seller appear in person, documents are verified, taxes are paid at the cashier window, and the transfer is endorsed on the back of the title deed — all on the same day. Knowing what to bring and what to expect takes the uncertainty out of it.",
    updated: "2026-06-15",
    body: [
      "Until the Land Department officer stamps the title deed, nothing has legally changed hands. The Land Office registration day is the moment a signed agreement becomes a registered property right — and it runs to a predictable script. Both buyer and seller must appear in person, or send a holder of a properly executed power of attorney in their place.",
      { h: "Who needs to be there" },
      {
        ul: [
          "**Buyer and seller** — or each party's authorised representative. A representative needs a power of attorney signed by the principal, with a copy of the principal's Thai national ID (for Thai nationals) or passport (for foreigners). For a foreign buyer, the POA typically needs notarisation and, from Hague Convention countries, an apostille.",
          "**Company sellers** — an authorised director must attend and bring the company's corporate documents: a current affidavit from the Department of Business Development (DBD), a board resolution authorising the sale, and the list of authorised signatories.",
          "**Lawyer or agent** — often present as representative of one or both parties; the Land Office is comfortable with this arrangement and the process runs faster with a familiar face at the counter.",
        ],
      },
      { h: "Documents to bring" },
      {
        ul: [
          "**Original title deed** (Chanote or Nor Sor 3 Gor) — the seller holds this and presents it on the day.",
          "**Identification** — Thai national ID for Thai nationals; passport with multiple copies for foreigners.",
          "**Signed sale and purchase agreement** — the contract signed at reservation stage.",
          "**FET form (Foreign Exchange Transaction form)** — for a foreign buyer of a condominium this is required by the Land Office to confirm foreign-sourced funds (part of the 49% foreign-quota check). For a leasehold villa the Land Office does not always require it for registration itself — but keep it regardless, since you need it to repatriate proceeds when you sell. See [Costs, taxes and the FET form](/knowledge/cost-of-buying-taxes-and-fees).",
          "**Power of attorney with ID copy** — if either party is using a representative rather than attending in person.",
          "**Corporate documents** — if buyer or seller is a company (DBD affidavit, board resolution, authorised signatory list).",
        ],
      },
      { h: "What happens, step by step" },
      {
        ul: [
          "**Take a queue number.** Arrive early — the Koh Phangan Land Office does not always offer advance appointment booking, and morning slots go first. Your lawyer or agent usually handles the queue.",
          "**ID and document check.** When called, the officer verifies the identity of both parties and inspects the original title deed.",
          "**Title verification.** The officer checks the deed against the official Land Office record — confirms the seller's ownership, reveals any unresolved mortgages or encumbrances, and validates the right to transfer.",
          "**Price declaration.** Both parties declare the agreed sale price. The Land Office uses the higher of the declared price or the official government appraised value as the tax base.",
          "**Tax calculation.** The officer calculates all applicable taxes: transfer fee (2% of appraised value), Specific Business Tax if applicable (3.3%), or stamp duty (0.5% if held 5+ years), and withholding tax. The contract should have settled who pays what before this moment.",
          "**Payment at the cashier.** Fees are paid — in cash, by bank draft (cashier's cheque), or at many offices by bank transfer. Bring the agreed amounts ready; the full tax bill must be cleared before the transfer is processed.",
          "**Signing.** Both parties sign the Land Office's official transfer forms in front of the officer. For a leasehold, separate lease-registration forms are used.",
          "**Endorsement on the deed.** The transfer — or the lease — is recorded on the back of the title deed and in the official register. For a freehold transfer, the new owner's name is entered. For a lease, the lessee's name, the term and the registered rent are entered.",
          "**Updated deed issued.** For a freehold transfer, the deed is re-issued with the new owner's details. For a leasehold, the original deed stays with the landowner — your proof is the stamped registered lease copy.",
        ],
      },
      { h: "Leasehold registration: how it differs" },
      "When you register a lease rather than a freehold transfer, the title deed does not change ownership — it stays in the landowner's name. What is registered on the back of the deed is the lessee's name, the term and the rental figure. The registration fee is **1% of the total rent payable over the registered term**, plus **0.1% stamp duty** — calculated on contracted rent, not market value.",
      "You do not receive the title deed at the end of the day. The landowner keeps the original. Your documentary proof is the stamped copy of the registered lease contract. Store it as securely as you would a title deed.",
      "One key limit: the maximum term registrable in a single lease instrument is 30 years. After the March 2025 Supreme Court ruling (Case No. 4655/2566), a pre-agreed renewal for further 30-year periods signed at the same time as the original lease is void for the renewal periods — only the initial registered term is enforceable as a property right. See [Superficies, usufruct and lease: the three anchors](/knowledge/superficies-vs-usufruct-vs-lease) for the legal background.",
      { h: "What you leave with" },
      {
        ul: [
          "For a **freehold transfer**: the updated title deed with your name on it.",
          "For a **leasehold**: the original registered lease contract stamped by the Land Office — this is your title document.",
          "Tax and fee receipts — keep these for accounting and future sale.",
          "The FET form from your original bank transfer — required to repatriate proceeds when you eventually sell.",
        ],
      },
      "From queue to completion, a clean day at the Land Office typically takes two to four hours — longer when documents are incomplete or a tax figure is disputed. The registration day itself is rarely the problem; issues that surface there usually have roots in the due diligence stage. Once the deed is endorsed, you hold what you bought. See [How to buy property on Koh Phangan step by step](/knowledge/how-to-buy-property-step-by-step) for where this day fits in the full purchase timeline.",
    ],
    takeaways: [
      "Both parties must appear in person or through a power of attorney — bring the original title deed, passports and the agreed payment amounts.",
      "Taxes are calculated on the higher of declared price or the Land Office appraised value — settle in the contract who pays what before the day.",
      "For a leasehold, you do not receive the title deed — the landowner keeps it; your proof is the stamped registered lease contract copy.",
      "Leasehold registration costs 1% of total contracted rent over the term plus 0.1% stamp duty, endorsed on the back of the deed.",
      "Keep the tax receipts and the FET form from your original bank transfer — both are needed when you eventually sell.",
    ],
    sources: [
      {
        title: "IRES Thailand — Thailand Property Transfer Process",
        url: "https://iresthailand.com/pattaya/transfer-process/",
      },
      {
        title: "Forbes & Partners — The Final Handshake: Your Definitive 2025 Guide to the Title Deed Transfer at Thailand's Land Office",
        url: "https://www.forbesandpartners.com/thailand-property-title-deed-transfer-guide-2025/",
      },
      {
        title: "My Thailand Lawyer — Land Registration Process in Thailand",
        url: "https://mythailandlawyer.com/land-registration-process-in-thailand/",
      },
      {
        title: "Thai Land Code — lease registration maximum 30 years, fee 1% of total rent plus 0.1% stamp duty (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "process",
    faqQuestion: "What happens at the Thailand Land Office on the day a property deal is registered?",
  },
  {
    slug: "superficies-vs-usufruct-vs-lease",
    kbId: "kb-0018",
    topic: "Structures",
    title: "Superficies, usufruct and lease: three ways to anchor a building on Thai land",
    short:
      "Three registered rights under Thailand's Civil and Commercial Code each give a foreigner different security, transferability and inheritance outcomes. For a villa, the standard is lease plus superficies — the lease covers occupancy, the superficies separately titles the building. Usufruct suits a different situation: protecting a foreign spouse on land the Thai partner owns.",
    updated: "2026-06-15",
    body: [
      "A foreigner buying a villa on Koh Phangan cannot own the land — but can own the building on it, and can hold a registered right to be on the land. Three distinct mechanisms in the Thai Civil and Commercial Code each do something different. Getting the combination right at purchase determines whether you can sell the asset later, pass it to your heirs, or lose it the moment you die.",
      { h: "The three rights at a glance" },
      {
        ul: [
          "**Superficies (สิทธิเหนือพื้นดิน)** — Code Sections 1410–1416. The right to own buildings or structures on someone else's land. If granted for a fixed term: transferable (sellable), inheritable, mortgageable. If granted for a lifetime: lapses at the holder's death.",
          "**Usufruct (สิทธิเก็บกิน)** — Sections 1417–1428. The right to possess, use, enjoy, manage and take income from another person's property. Cannot be sold or left to heirs. A lifetime usufruct terminates at the holder's death. Survives a change of landowner once registered.",
          "**Lease** — Sections 537–571. A tenancy right to occupy for a fixed term, capped at 30 years for residential property. Registered leases survive a change of landowner. Pre-agreed renewals beyond 30 years are void per the March 2025 Supreme Court ruling (Case No. 4655/2566).",
        ],
      },
      { h: "Superficies: owning the building, not the land" },
      "Section 1410 of the Civil and Commercial Code creates the right to 'own buildings, structures or plantations upon land belonging to another person.' For a foreign villa buyer this means the building is titled separately from the land it sits on — you own the house, a Thai national owns the ground. The superficies is the legal instrument that makes that separation enforceable against the world, including future landowners.",
      "For a **fixed-term superficies** — the form used in most commercial transactions — the right is transferable to a buyer, inheritable by heirs and mortgageable. The maximum term is 30 years per instrument, after which it can be renewed. If granted for the lifetime of a party rather than a fixed term, it cannot be sold or inherited and lapses at death, making it unsuitable for most villa purchases where exit and succession matter.",
      "Registration at the Land Office is mandatory. An unregistered superficies creates only a personal obligation between the original parties — it has no legal effect against a third party who acquires the land. Always confirm the superficies is endorsed on the back of the title deed. See [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      { h: "Usufruct: use and income, but not yours to sell" },
      "Under Sections 1417–1428, a usufructuary has the right to occupy, manage and earn income from a property — sub-lease it to tenants (up to 3 years at a time), live in it and cover maintenance. What a usufructuary cannot do is assign the right to another person or leave it to heirs. A lifetime usufruct terminates at the holder's death.",
      "A usufruct does survive a change of landowner when properly registered — a meaningful protection. This makes it useful in specific situations: most commonly, where a Thai spouse or relative holds the freehold and the foreign partner needs a registered lifetime right to use and earn income from the property. It is not the right tool for a commercial villa purchase where the buyer intends to sell or bequeath the asset, because the non-transferability constraint is fundamental.",
      { h: "Lease: occupancy for a fixed term" },
      "A registered lease of more than three years gives the lessee a real property right that survives a change of landowner — the new owner steps into the original landlord's position. For a villa, the lease is the foreigner's occupancy anchor: the right to be on the land and use it for the registered term.",
      "**The March 2025 Supreme Court ruling (Case No. 4655/2566) settled a long-debated question.** A lease that pre-commits to multiple consecutive 30-year terms — the 30+30 or 30+30+30 structure widely used before the ruling — is valid only for the initial 30-year term. Renewal periods signed on the same day as the original lease, even when paid for in full, are void. Renewal is only enforceable when the then-current landowner agrees at the time of that renewal. Section 540 of the Civil and Commercial Code has always capped leases at 30 years; the ruling removes the legal ambiguity many contracts were relying on.",
      "The practical consequence: the occupancy security of a lease ends at 30 years unless the landowner at that time agrees to renew. Plan the exit timeline around the primary term and treat any renewal promise as a bonus, not a guarantee. This is an additional reason the superficies is essential alongside the lease — building ownership survives independently of what happens to the lease at renewal.",
      { h: "Why the standard villa structure is lease + superficies" },
      "The two rights are complementary. The lease anchors your right to be on the land for 30 years. The fixed-term superficies separately titles the building — which you can sell, mortgage and leave to your heirs regardless of what happens to the lease. Together they give you: occupancy security for the term, separately owned building equity, and the ability to transfer either right.",
      {
        ul: [
          "A lease alone does not give you building ownership — only the right to occupy the land.",
          "A superficies alone does not give you the right to access the land beneath the building.",
          "A usufruct as the sole instrument means the property right can never be sold or left to heirs.",
          "The standard structure — 30-year registered lease plus fixed-term registered superficies — closes all three gaps.",
        ],
      },
      "Both must be registered at the Land Office and endorsed on the back of the title deed to bind future landowners. See [A day at the Land Office](/knowledge/land-office-registration-day) for what that registration looks like in practice, and [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa) for the full combined structure.",
    ],
    takeaways: [
      "Superficies (Sections 1410–1416): own a building on Thai land; if fixed-term, it is transferable, inheritable and mortgageable.",
      "Usufruct (Sections 1417–1428): use and earn income from someone else's property — cannot be sold, assigned or inherited; a lifetime usufruct terminates at death.",
      "Lease (capped at 30 years by Section 540): gives occupancy only; a pre-agreed renewal beyond 30 years is void per the March 2025 Supreme Court ruling (Case No. 4655/2566).",
      "The standard villa structure is a 30-year registered lease (occupancy) plus a fixed-term registered superficies (building ownership) — both must be registered at the Land Office.",
      "Both superficies and registered usufruct survive a change of landowner; an unregistered right binds only the original parties.",
    ],
    sources: [
      {
        title: "Thai Civil and Commercial Code — Superficies Sections 1410–1416, Usufruct Sections 1417–1428, Lease Sections 537–571",
      },
      {
        title: "Siam Legal International — Supreme Court Ruling on Long-Term Leases in Thailand",
        url: "https://www.siam-legal.com/thailand-law/supreme-court-ruling-on-long-term-leases-in-thailand/",
      },
      {
        title: "Houseviser — Usufruct, superficies, habitation: alternative real rights for foreigners in Thailand",
        url: "https://houseviser.com/guide/legal/usufruct-superficies-habitation",
      },
      {
        title: "JusLaws — A Complete Legal Guide to Property Law in Thailand for Foreigners",
        url: "https://www.juslaws.com/articles/property-law-thailand-legal-guide-foreigners",
      },
      {
        title: "SILQ Law — Thai Supreme Court Limits Foreign Leases: No more 30-30-30 (March 2025)",
        url: "https://silqlaw.com/2025/thailand-supreme-court-lease-ruling-2025-silq-law/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "What is the difference between superficies, usufruct and a lease for a foreign property buyer in Thailand?",
  },
  {
    slug: "bringing-money-into-thailand-fet-form",
    kbId: "kb-0019",
    topic: "Costs",
    title: "Bringing money into Thailand correctly: the FET form, step by step",
    short:
      "The Foreign Exchange Transaction form is issued by your Thai bank when foreign currency arrives and converts to baht. For a condo it is mandatory at the Land Office; for a leasehold villa you will need it to repatriate proceeds when you sell. The process is straightforward — but the form must be requested correctly and kept for the life of the investment.",
    updated: "2026-06-16",
    body: [
      "Moving your purchase funds into Thailand sounds simple, but the one step most buyers skip at the time is the one that causes trouble years later: correctly requesting the Foreign Exchange Transaction (FET) form from the receiving Thai bank. Miss this, and repatriating your money when you sell becomes significantly harder.",
      { h: "What the FET form is" },
      "The FET form — formerly known as Thor Tor 3 (ต.ท.3) — is an official certificate issued by an authorised Thai bank. It records that foreign currency arrived from abroad, was converted to Thai baht, and was received for a stated purpose. The Bank of Thailand uses it to track inbound foreign exchange. For a property buyer it has two practical functions: it proves the funds came from outside Thailand (a requirement for condo registration), and it is the document you present to your bank when you eventually want to repatriate the sale proceeds.",
      { h: "When it is required" },
      {
        ul: [
          "**Condominium purchase** — the Land Office will not register a condo in a foreign buyer's name without the original FET form. It is non-negotiable for this transaction.",
          "**Leasehold villa** — the Land Office does not always require the FET form for lease registration itself. But you still need it to take your proceeds out of Thailand when you sell — so 'not required at the desk today' is not a reason to skip it.",
          "**Transfers under USD 50,000** — for amounts below the threshold, the bank issues a credit note or bank letter of guarantee instead of an FET form. These contain the same information and serve the same legal purpose. Keep them equally carefully.",
        ],
      },
      { h: "Step by step: how to get it" },
      {
        ul: [
          "**Transfer funds from abroad in foreign currency.** Send by SWIFT from your overseas bank account to the Thai bank account designated for the purchase — your personal Thai account, the lawyer's escrow account, or the developer's account. The funds must arrive as foreign currency (USD, EUR, GBP, etc.), not as pre-converted baht.",
          "**Include the correct purpose statement.** In the SWIFT transfer instructions, state the purpose clearly: for example, 'Purchase of property — [property address or unit reference] — [your full name as per passport].' The Thai bank uses this to populate the FET form correctly.",
          "**The receiving Thai bank converts the currency to baht.** Once the SWIFT arrives, the Thai bank converts it at the prevailing exchange rate and credits the baht to the designated account.",
          "**Request the FET form from the bank.** Visit or contact the branch that received the foreign-currency transfer and request the FET form. Bring your passport. The bank issues the form based on the conversion record — amounts, your name and the stated purpose.",
          "**Verify the form before you leave.** Check: your full name matches your passport exactly; the foreign currency amount is correct; the purpose wording matches the property being purchased; the baht conversion amount is stated.",
          "**Keep the original permanently.** You will need it again when you sell. A photocopy is not sufficient for repatriation; Thai banks require the original.",
        ],
      },
      { h: "What the form must show" },
      "The FET form must contain: your full legal name (matching your passport exactly), the foreign currency amount transferred, the Thai baht amount after conversion, the sending bank and account, the receiving bank and account, and the stated purpose of the transfer. If issued for a specific property, the reference should appear on it. A name mismatch between the FET and the title or lease registration is a problem — check this immediately.",
      { h: "Wise, third-party platforms and smaller transfers" },
      "For smaller transfers, services such as Wise are commonly used and generally cheaper on exchange rates. Wise routes funds through correspondent banking, and the money arrives at a Thai bank. The FET form (or credit note for amounts below USD 50,000) is still issued by the receiving Thai bank, not by Wise. If you transfer to a lawyer's or developer's account rather than your own, the FET will name them as recipient — request the bank confirmation document yourself, or ensure your lawyer secures and passes it to you.",
      { h: "Using the FET to repatriate proceeds when you sell" },
      "When you sell and want to wire the proceeds abroad, the Thai bank's compliance team will ask for: the original FET form from your purchase, the Land Office sale agreement (the stamped transfer document), and the Land Office tax and fee receipts. Together these prove the original investment was foreign-sourced and that the proceeds are the return on that foreign capital. Present them as a bundle — the bank will not initiate a foreign outward transfer without them. For the full picture of taxes when you sell, see [Costs, taxes and the FET form](/knowledge/cost-of-buying-taxes-and-fees) and [Selling your leasehold villa](/knowledge/selling-leasehold-villa-exit-liquidity).",
      { h: "If you think you have lost it" },
      "Contact the issuing Thai bank directly. Banks maintain records of foreign exchange transactions, and some branches can issue a certified replacement letter confirming the original transaction — though this is at the bank's discretion and not guaranteed. Keeping a high-resolution scan in cloud storage alongside the physical original is strongly recommended.",
    ],
    takeaways: [
      "For a condo purchase, the Land Office will not register without the original FET form — it is non-negotiable.",
      "For a leasehold villa, the FET may not be required at the desk on registration day, but you need it to repatriate proceeds when you sell.",
      "Transfers below USD 50,000 receive a credit note or bank letter rather than an FET; both serve the same legal purpose — keep them.",
      "The form is issued by the receiving Thai bank; include a clear purpose statement in the SWIFT transfer instructions.",
      "Keep the original FET permanently — a photocopy is not sufficient for repatriation.",
    ],
    sources: [
      {
        title: "PropertyScout — The FET: All there is to know about foreign transaction forms in Thailand",
        url: "https://propertyscout.co.th/en/guides/the-fet-all-there-is-to-know-about-foreign-transaction-forms-in-thailand/",
      },
      {
        title: "SunwayEstates — The Foreign Exchange Transaction (FET) Form in Thailand",
        url: "https://sunwayestates.com/blog/post/The-Foreign-Exchange-TransactionFET-Form-in-Thailand",
      },
      {
        title: "Thavorn Asia Property — FET Form in Thailand: Complete Guide for Foreign Buyers 2025",
        url: "https://thavorn.asia/en/news/foreign-exchange-transaction-fet-form-in-thailand-complete-guide-for-foreign-buyers-2025-520",
      },
      {
        title: "Bank of Thailand — foreign exchange transaction reporting regulations (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion:
      "How do I transfer money into Thailand correctly to buy property, and what is the FET form?",
  },
  {
    slug: "renewing-30-year-lease-risks",
    kbId: "kb-0020",
    topic: "Structures",
    title: "Renewing a 30-year lease in Thailand: what actually happens and the real risks",
    short:
      "After the March 2025 Supreme Court ruling, there is no ambiguity: pre-agreed automatic renewals beyond 30 years are void. Renewal requires the then-current landowner to agree at the time. That makes planning around the exit critical from day one — along with the right protective clauses within the initial term.",
    updated: "2026-06-16",
    body: [
      "The single most persistent misconception in Thai property is 'my lease renews automatically.' It does not — and after the March 2025 Supreme Court ruling (Case No. 4655/2566), there is no longer legal ambiguity about this. Understanding what actually happens at the end of a 30-year term changes how you should buy, what clauses to insist on, and how to plan the exit.",
      { h: "What the law says: Section 540" },
      "Section 540 of the Civil and Commercial Code sets an absolute ceiling: a lease of immovable property cannot exceed 30 years. The section explicitly permits renewal — but only at expiration, and only for a fresh term that also cannot exceed 30 years. No contract can override this. A lease that purports to grant more than 30 years from inception violates a mandatory rule of law and is void for the excess.",
      { h: "What the Supreme Court settled in March 2025" },
      "Judgment No. 4655/2566, issued in March 2025, settled a long-debated question about so-called '30+30+30' structures. These were leases in which all three 30-year terms were signed simultaneously — often with a single up-front payment covering all three periods — marketed as giving 60 or 90 years of secure tenure.",
      "The Court ruled that treating this arrangement as a single long-term lease disguised as sequential terms violates Section 540. The two renewal periods signed at the same time as the initial lease — even if paid for — are void. Only the initial registered 30 years constitutes a real property right. The ruling also highlighted renewals with identical terms as a marker of the circumvention intent; future renewals negotiated fresh, with adjusted rents, may be on stronger footing — but that is a fresh negotiation at expiry, not an enforceable pre-agreed commitment.",
      { h: "How renewal actually works post-ruling" },
      "At the end of the registered 30-year term, a further lease is legally possible under Section 540. But renewal depends entirely on the person who owns the land at that point agreeing to grant a new lease. They are under no legal obligation to do so.",
      {
        ul: [
          "**The original lessor may no longer own the land.** It may have been sold, inherited by heirs or passed through corporate succession. A new owner steps into the contractual shoes of the original landlord for the duration of the registered lease — but has no obligation to grant a new one.",
          "**Renewal can be on entirely new commercial terms.** There is nothing stopping the landowner from demanding a substantially higher rent, a shorter term, or different conditions.",
          "**No automatic compensation.** If the landowner declines to renew, there is generally no legal obligation to compensate you for the expiry — unless the original lease contract specifically included such a provision.",
          "**Renewal cannot be pre-registered.** You cannot go to the Land Office with a renewal signed before the original lease expires and register it as a property right for the next period.",
        ],
      },
      { h: "What is still enforceable within the initial 30 years" },
      "The ruling does not invalidate rights and protections that operate within the initial registered term. These are enforceable and worth negotiating when the lease is drafted:",
      {
        ul: [
          "**Succession clause** — the right of your heirs to step into your position as lessee if you die during the term. Without this, the lease may end at your death. See [Inheritance on Koh Phangan](/knowledge/inheritance-leasehold-and-villa).",
          "**Assignment clause** — the right to sell the lease to a third party. Without an explicit assignment clause, transferring the lease to a buyer may require the landowner's active cooperation. See [Selling your leasehold villa](/knowledge/selling-leasehold-villa-exit-liquidity).",
          "**Right of first refusal to purchase** — if the landowner wants to sell the land during your tenancy, you get the first option at whatever price they are offering. This may eventually give you a path to converting to freehold.",
          "**Compensation clause on early termination** — if the landowner materially breaches the lease or sells the land in a way that triggers early termination, the clause specifies the compensation you receive.",
          "**Registered superficies on the building** — separately titles the villa from the land. The superficies itself can carry a renewal clause for a further 30-year term, and building ownership survives independently of what happens to the lease. See [Superficies, usufruct and lease](/knowledge/superficies-vs-usufruct-vs-lease).",
        ],
      },
      { h: "If you already hold a 30+30 or 30+30+30 lease" },
      "Your initial 30-year registered term remains fully valid and enforceable as a property right. The ruling does not retroactively cancel the first period. What it settles is that renewal periods signed simultaneously with the original are void beyond year 30.",
      "The practical advice from Thai property lawyers is to begin renewal conversations with the landowner well before the term expires — ideally five to ten years out — while the leverage of a good relationship still exists. The worst time to negotiate is in year 29 under pressure. If the landowner has changed, trace the new owner early and establish a relationship. Some lawyers also advise exploring conversion (BOI-promoted structure or condominium freehold if the building qualifies) while the original lease still has years left and your position is strong.",
      { h: "For new buyers: price and plan around the primary term" },
      "A leasehold purchase on Koh Phangan today should be priced and planned as a 30-year asset. Renewals are possible but not guaranteed — treat any renewal promise as a bonus that may materialise, not as a committed additional term. The planning question is: can you achieve your financial goals within the primary 30-year period? A lease with 25 years remaining is quite different from one with 12. See [Selling your leasehold villa](/knowledge/selling-leasehold-villa-exit-liquidity) for how the remaining term affects exit liquidity and pricing.",
    ],
    takeaways: [
      "Section 540 caps leases at 30 years; the March 2025 Supreme Court ruling (Case No. 4655/2566) makes pre-agreed automatic renewals beyond 30 years void.",
      "Renewal requires the then-current landowner to agree — they are under no legal obligation to do so, and may have changed.",
      "Plan and price around the primary 30-year term; treat renewal promises as contractual aspirations, not property rights.",
      "Within the initial 30 years, negotiate: succession clause, assignment clause, right of first refusal to purchase, and a registered superficies on the building.",
      "Existing 30+30+30 holders: the first term is valid; begin renewal conversations 5–10 years before expiry while leverage remains.",
    ],
    sources: [
      {
        title:
          "Addleshaw Goddard — Thai Supreme Court strikes down 'automatic' long-term lease renewals (2025)",
        url: "https://www.addleshawgoddard.com/en/insights/insights-briefings/2025/real-estate/thai-supreme-court-strikes-down-automatic-long-term-lease-renewals/",
      },
      {
        title:
          "Lawyers for Expats Thailand — The 30-Year Maximum Lease and the End of '30+30+30'",
        url: "https://www.lawyersforexpatsthailand.com/post/the-30-year-maximum-lease-and-the-end-of-30-30-30-why-pre-agreed-lease-renewals-are-now-void-and",
      },
      {
        title: "Siam Legal International — Supreme Court Ruling on Long-Term Leases in Thailand",
        url: "https://www.siam-legal.com/thailand-law/supreme-court-ruling-on-long-term-leases-in-thailand/",
      },
      {
        title:
          "Thai Civil and Commercial Code — Section 540, lease of immovable property, 30-year maximum (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion:
      "Can I renew my 30-year lease in Thailand, and are renewal clauses enforceable?",
  },
];

export function getKbArticleBySlug(slug: string): KbArticle | undefined {
  return KB_ARTICLES.find((a) => a.slug === slug);
}