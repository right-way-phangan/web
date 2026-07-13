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
      "Funds usually move by SWIFT to the partner law firm's client account — or to the seller at closing; Wise is common and cheaper on FX for smaller amounts. Receive into a major Thai bank (Bangkok Bank, Kasikorn, SCB).",
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
          "**7. Transfer the funds.** By SWIFT or Wise to the partner law firm's client account. Keep the FET form — you'll need it to take proceeds back out when you sell. See [Costs, taxes and the FET form](/knowledge/cost-of-buying-taxes-and-fees).",
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
          "**A staged payment schedule** tied to construction milestones — not the full price up front — and what happens to your money if the developer fails (guarantees, milestone-based payments).",
          "**The contract** — completion date, penalties for delay, the handover and snagging process, and precisely what the spec includes.",
        ],
      },
      { h: "On Koh Phangan specifically" },
      "The island's new-build market is small, with relatively few large developers, so a track record is easier to verify — and more important when it's thin. The 2025 environmental zoning also constrains what can be built where, so confirming a project's permits is not a formality here; it's central. A beautiful render means nothing if the project can't legally be completed as drawn.",
      { h: "How to keep the risk down" },
      "Pay in stages against real construction progress rather than a large amount up front, favour a developer who has completed comparable projects, and have an independent lawyer review the contract before you sign anything. The overall journey is the same as any purchase — see [the step-by-step buying process](/knowledge/how-to-buy-property-step-by-step).",
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
          "**Transfer funds from abroad in foreign currency.** Send by SWIFT from your overseas bank account to the Thai bank account designated for the purchase — your personal Thai account, the partner law firm's client account, or the developer's account. The funds must arrive as foreign currency (USD, EUR, GBP, etc.), not as pre-converted baht.",
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
  {
    slug: "thai-company-for-property-49-51",
    kbId: "kb-0021",
    topic: "Structures",
    title: "A Thai company for property (49/51): when it makes sense, when it's toxic",
    short:
      "For decades, foreign buyers used a Thai-majority company to access land they couldn't own in their own name. The 49/51 structure was always legally fragile; since 2025 the nominee-enforcement campaign has made it actively dangerous for a private villa purchase. For a genuine operating business with real Thai partners, a different analysis applies.",
    updated: "2026-06-17",
    body: [
      "A Thai company with 49% foreign and 51% Thai shareholding was the default workaround for Thailand's land-ownership prohibition for much of the 2000s and 2010s. Foreigners cannot own land in their own name; but a Thai company can — so the logic was to park the land inside a company the foreigner controlled in practice, with Thai shareholders holding majority shares on paper. That logic has not changed. What has changed is the cost of being caught using it.",
      { h: "What the structure actually is" },
      "Under the Foreign Business Act (FBA) B.E. 2542 (1999), a company is 'foreign' if 50% or more of its shares are beneficially held by non-Thai nationals. A company with 51% Thai and 49% foreign shareholding is therefore classified as a Thai company — able to own land and operate in restricted sectors. The structure is not inherently illegal: a Thai majority company with genuine Thai co-investors running a real business is lawful.",
      "The illegal version — the nominee structure — replaces genuine Thai investors with Thai nationals who hold shares only on paper, with no real capital contribution, no economic stake and no involvement in decisions. The foreigner controls the business and receives its economic benefit. That arrangement is what Sections 36–37 of the FBA and Sections 111–113 of the Land Code criminalise.",
      { h: "How authorities now detect it" },
      {
        ul: [
          "**DBD Order No. 2/2568** (effective January 2026): all new company incorporations require Thai shareholders to produce bank statements and source-of-funds documentation proving they genuinely funded their shares.",
          "**DBD Order No. 1/2569** (effective April 2026): any company amendment involving a foreign director triggers signed Investment Confirmation Letters and supporting bank evidence for every Thai shareholder.",
          "**IBAS cross-referencing**: the DBD's Intelligence Business Analytic System checks company filings, tax records and land registers against each other. A capital-to-land-value mismatch triggers a forensic audit.",
          "**Multi-agency coordination**: the DBD, Department of Lands, DSI and AMLO now share data. A nominee pattern found by one agency opens investigations by all four.",
        ],
      },
      { h: "The criminal consequences" },
      "Both the Thai nominee and the foreign beneficiary face criminal liability. Under the FBA (Sections 36–37): up to **3 years imprisonment** and fines of **THB 100,000–1,000,000**, plus daily penalties of THB 10,000–50,000. Under the Land Code (Sections 111–113): up to **2 years** and fines up to **THB 20,000**. Beyond criminal penalties, Land Code Section 94 permits the authorities to order the company to **sell the land within 180 days to 1 year** at whatever price the forced sale yields. The land itself is at risk, not only the company.",
      "Enforcement since 2025 has not been selective. An estimated 857–875 cases were prosecuted by December 2025, with total seized asset value of roughly THB 15.1–15.3 billion. Over 46,918 companies were flagged, with 26,830 targeted for inspection in 2025 alone. For the specific enforcement track record on Koh Phangan and its spread to Krabi, see [Nominee-ownership enforcement spreads to Krabi](/knowledge/nominee-crackdown-krabi-islands-2026).",
      { h: "When a Thai company structure is genuinely different" },
      "A 49/51 company is not automatically a nominee arrangement. The structure makes sense — and operates within the law — when:",
      {
        ul: [
          "**Genuine Thai co-investors** hold their shares with documented capital from their own verified funds, and are actively involved in the business's decisions and financial outcomes.",
          "**The company runs a real operating business** — property development, rental management, a hospitality operation — that independently justifies the company's existence and the land it holds.",
          "**BOI-promoted projects**: Board of Investment promotion allows specific foreign-majority or fully foreign-owned companies to own land for their promoted business activities, though recent BOI notifications have narrowed this to operational necessity; residential use for the foreign owner is generally excluded.",
          "**The company is not a shell**: it files and pays taxes, has employees or contractors, and generates documented income from operations — not merely from holding an asset a foreigner lives in.",
        ],
      },
      "The test is substance over form. A company that exists solely to let a foreigner use a villa they couldn't otherwise own is a nominee arrangement regardless of how carefully the paperwork is drafted. A company that operates a genuine rental business, employs staff and pays corporate income tax on its earnings is a different animal.",
      { h: "For a private villa buyer: the practical answer" },
      "For a foreign buyer seeking to own a villa for personal use or occasional rental on Koh Phangan, the Thai company route is not the answer — and hasn't been since 2025. The criminal exposure for both buyer and Thai shareholders, and the forced-sale risk for the land itself, make it the wrong vehicle for a personal home. The clean, durable route is a registered leasehold combined with a fixed-term superficies on the building. See [Leasehold vs freehold](/knowledge/leasehold-vs-freehold) and [Superficies, usufruct and lease](/knowledge/superficies-vs-usufruct-vs-lease).",
    ],
    takeaways: [
      "A 49/51 company is only lawful if the 51% Thai shareholders are genuine investors who funded their own shares with verifiable funds — nominees are criminal.",
      "Both the Thai nominee and the foreign beneficiary face up to 3 years imprisonment and fines of THB 100,000–1,000,000 under the FBA.",
      "Land Code Section 94 permits forced sale of the land within 180 days to 1 year if a nominee structure is found — the asset itself is at risk.",
      "Since January 2026, new company incorporations require bank statement proof of genuine shareholder investment; any amendment with a foreign director requires sworn Investment Confirmation Letters.",
      "For a private villa on Koh Phangan, the correct structure is leasehold + superficies — not a Thai company holding the land.",
    ],
    sources: [
      {
        title: "Global Law Experts — How Foreign Property Owners Can Protect Themselves in Thailand After the 2026 Nominee Company Crackdown",
        url: "https://globallawexperts.com/how-foreign-property-owners-can-protect-themselves-in-thailand-after-the-2026-nominee-company-crackdown/",
      },
      {
        title: "Terms.Law — Thailand Nominee Structures: Why They Fail and Who Goes to Prison",
        url: "https://terms.law/Thai/business/nominee-structures-risks.html",
      },
      {
        title: "Lex Bangkok — Nominee Land Ownership Thailand: Confiscation Risk (2026)",
        url: "https://lexbangkok.com/nominee-land-ownership-thailand-confiscation-risk/",
      },
      {
        title: "Foreign Business Act B.E. 2542 (1999), Sections 36–37; Land Code Sections 111–113, Section 94 (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "Can a foreigner use a Thai company (49/51) to hold land or a villa on Koh Phangan?",
  },
  {
    slug: "building-a-villa-koh-phangan",
    kbId: "kb-0022",
    topic: "Phangan",
    title: "Building a villa on Koh Phangan: permits, zones, timelines and budget",
    short:
      "A foreign lessee can legally build on Koh Phangan — the construction permit titles the building in the builder's name, and a registered superficies separates that ownership from the land. The 2025 environmental zones constrain what you can build where, plans must be signed by licensed Thai professionals, and island logistics add 8–15% to mainland construction cost. Budget ฿18,000–60,000+/m² depending on finish, and 4–6 months for permit approval.",
    updated: "2026-06-17",
    body: [
      "Building your own villa on Koh Phangan is possible as a foreign buyer — and for buyers who want a custom design on a specific plot, it often makes more sense than buying a finished unit. The mechanism by which a foreigner ends up owning a building on land they lease is actually the heart of Thai property law: the construction permit (Por. Ror. 1) registers the building in the applicant's name, and a registered superficies makes that ownership enforceable against the world, including future landowners.",
      { h: "Can a foreigner build? The legal basis" },
      "A foreigner cannot own land in Thailand but can own a building. The right to build on a leasehold plot is typically granted in the lease agreement and the superficies instrument. The construction permit is applied for by the landowner or by the person authorised to build — in a leasehold, the lessee, with the landowner's written consent. The finished building is titled in the permit applicant's name. Paired with a registered superficies, that building ownership is separately transferable and inheritable. For the ownership structure that makes this work, see [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa) and [Superficies, usufruct and lease](/knowledge/superficies-vs-usufruct-vs-lease).",
      { h: "The building permit (Por. Ror. 1)" },
      "The building permit — **Por. Ror. 1** (ปร.1) — is issued by the relevant local administrative authority (on Koh Phangan, the Subdistrict Administrative Organisation, known as OrBorTor). A permit is required before any new construction, structural alteration or demolition under the Building Control Act B.E. 2522. Building without one exposes you to a demolition order and fines, and an unpermitted structure creates problems when you try to sell the building later.",
      { h: "Documents required" },
      {
        ul: [
          "**Licensed Thai architect's plans** — all design drawings must be signed by a registered Thai architect with their licence number. An overseas architect's drawings alone are not accepted.",
          "**Licensed Thai structural engineer's certification** — signed calculations and structural drawings from a registered Thai civil engineer.",
          "**Copy of the land title deed** — to confirm the plot and establish the applicant's authority to build; the lease agreement is typically included.",
          "**Site plan and boundary survey** — showing the building footprint, setbacks from boundaries, access roads and utility connections.",
          "**Construction specification documents** — materials, construction method, floor plans, elevations and sections.",
          "**Environmental compliance**: for projects triggering review thresholds (usable area ≥2,500 m², ≥50 guest rooms, or significant land alteration), an Initial Environmental Examination (IEE) or full EIA must be completed before the permit is issued — adding 6–14 months.",
        ],
      },
      { h: "The 2025 environmental zones: what limits apply where" },
      "Since May 2025, Koh Phangan is an environmental protection area with seven defined zones. The zone of the specific plot determines what you can build — and in some cases whether you can build at all.",
      {
        ul: [
          "**Zone 2 — beachfront/coastal** (within roughly 50 m of shore): hotel-type developments face size caps and wastewater requirements; small single-storey residential construction only within the tightest setback band.",
          "**Zone 3(1) — hillside (≥80 m elevation)**: one single house per parcel, maximum height 6 m, minimum 50% green space, natural-coloured roof with ≥80% pitch. No land subdivision, no resort-style retaining works.",
          "**Zone 3(2) — high elevation (≥140 m)**: maximum footprint 90 m², 70% open space (50% green), no terrain alteration. The tightest residential zone.",
          "**Zones 5–6 (sensitive/conservation islands)**: construction is generally prohibited except for government use.",
          "**Lower-elevation unzoned plots**: the general Building Control Act rules apply — height limits, setback ratios, plot coverage. Typically more permissive than the hillside zones.",
        ],
      },
      "Check the zone before you fall in love with a plot. A sea-view hillside plot at 90 m elevation will be subject to Zone 3(1) limits, not the more permissive general rules. For the full zone breakdown, see [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
      { h: "Permit timeline" },
      "The Building Control Act gives the local authority **45 days** to respond to a complete permit application. In practice — accounting for plan revisions, authority workload and requests for additional documents — the realistic window from submission to permit approval is **4–6 months** for a straightforward project at standard elevation. For a hillside build triggering extra environmental checks, or any project requiring an IEE or EIA, add 6–14 months for the environmental assessment alone.",
      "Total project timeline from concept to handover: design brief and architect engagement (1–2 months), detailed design development (2–4 months), permit submission and approval (4–6 months standard), construction (6–18 months depending on scale and finish). A realistic end-to-end schedule for a custom villa is **18–36 months**.",
      { h: "Construction cost: what to budget" },
      "On Koh Phangan, construction is quoted per square metre of built area. Current (2025–2026) market bands:",
      {
        ul: [
          "**Basic / Thai standard — ฿18,000–25,000/m²**: simple layouts, local materials, functional finishes.",
          "**Mid-range / Western standard — ฿25,000–40,000/m²**: the most common band for foreign-buyer villas — modern design, imported fixtures, quality tiling.",
          "**Premium / luxury — ฿40,000–60,000+/m²**: high-spec materials, bespoke joinery, smart-home systems, imported bathrooms and kitchen.",
        ],
      },
      "These figures are for built area only and **exclude**: the swimming pool (typically ฿400,000–800,000+ depending on size and finish), external works (driveways, retaining walls, landscaping), professional fees (architect, engineer, project manager — typically 8–15% of build cost), permit and connection fees, furniture, and utility hookups.",
      "**Island logistics uplift**: Koh Phangan runs 8–15% above equivalent mainland costs. The island has a smaller contractor base; specialist trades often need to be ferried in from the mainland, and all materials arrive by barge. Factor in scheduling delays around rough-sea periods and high-season labour shortages.",
      { h: "The permit puts the building in your name" },
      "The construction permit is the document that makes the building legally yours. For a foreign lessee, it is applied for with the landowner's written consent, issued in the lessee's name, and — combined with a registered superficies at the Land Office — creates an asset you can sell, mortgage and leave to your heirs independently of the land lease. Do not start any work before the permit is in hand. An unpermitted structure is a liability at the point of sale and cannot be formally titled.",
    ],
    takeaways: [
      "A foreign lessee can build on a leasehold plot with the landowner's consent — the construction permit (Por. Ror. 1) titles the building in the builder's name.",
      "Plans must be drawn and signed by a licensed Thai architect and licensed Thai structural engineer — overseas credentials alone are not accepted.",
      "The 2025 zones impose firm limits: hillside (80m+) is capped at 6 m height and 50% green space; above 140 m the footprint is capped at 90 m².",
      "Budget ฿18,000–25,000/m² (basic) to ฿40,000–60,000+/m² (premium), plus an 8–15% island logistics uplift; pool, external works and professional fees are additional.",
      "Allow 4–6 months for permit approval on a standard build; hillside projects requiring an environmental assessment take significantly longer.",
    ],
    sources: [
      {
        title: "Thaim To Build — Cost to Build a Villa in Phuket vs Samui vs Koh Phangan (Price/m² 2025)",
        url: "https://thaimtobuild.com/villa-build-cost-phuket-samui-koh-phangan",
      },
      {
        title: "Sukhothai Inter Law — New Zoning Law for Koh Samui, Koh Phangan & Koh Tao (May 2025 Update)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
      {
        title: "BOI Thailand — Dealing with Construction Permits",
        url: "https://osos.boi.go.th/en/how-to/139/Dealing-with-Construction-Permits/",
      },
      {
        title: "Building Control Act B.E. 2522 (1979) — permit required before construction; 45-day review period (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "What permits and costs are involved in building a villa on Koh Phangan?",
  },
  {
    slug: "lease-contract-clauses-to-check",
    kbId: "kb-0023",
    topic: "Documents",
    title: "The lease contract on Koh Phangan: clauses a foreign buyer must check",
    short:
      "A registered lease is only as strong as the clauses it contains. The default developer draft almost never includes the four provisions that protect you most: succession, assignment, sublease rights and a right of first refusal on the land. Here is what to look for — and why each one matters.",
    updated: "2026-06-19",
    body: [
      "When a draft lease lands in front of you, you are looking at the document that defines your property rights for the next 30 years. Most buyers focus on the term and the rental figure — and miss the clauses that decide whether you can sell the lease, leave it to your heirs, rent to tenants, or have any recourse if the landowner breaches. A developer's default template rarely includes the strongest versions of these protections. Here is what to check before you sign.",
      { h: "Start with the basics" },
      {
        ul: [
          "**Term**: exactly stated start and end dates — 30 years is the maximum. Section 540 of the Civil and Commercial Code is an absolute ceiling; any clause purporting to grant a longer initial term is void for the excess.",
          "**Registration**: the lease must be registered at the Land Office and endorsed on the back of the title deed. Section 538 makes this mandatory for terms over three years to be enforceable beyond year three. Confirm the registration has actually happened — not just that you hold a signed contract.",
          "**Rental and payment**: amount, frequency, payment method, and any rent-escalation clause. Understand the total contracted rent over the full 30 years — that figure determines the Land Office registration fee (1% of total rent plus 0.1% stamp duty).",
          "**Permitted use**: what you can and cannot do. This is where restrictions on alterations, subletting and commercial activity usually appear — read it carefully.",
        ],
      },
      { h: "Succession clause: what happens when you die" },
      "Under Thai law, a lease may not automatically continue on the lessee's death — the standard position is that a lease is a personal contract, and without clear contractual provision your heirs may face difficulty asserting the right to continue for the remaining term. A succession clause provides certainty and should be treated as essential.",
      "The clause to seek: an express provision naming your heirs or estate as entitled to step into your position as lessee for the remaining term. The stronger version is to register co-lessees on the original lease — a surviving co-lessee (for example, a spouse) continues automatically without relying on a clause being invoked. The lease and the building must also be inherited together to keep the asset intact; see [Inheritance on Koh Phangan](/knowledge/inheritance-leasehold-and-villa).",
      { h: "Assignment clause: what happens when you sell" },
      "By default, a Thai lease cannot be assigned to a third party without the lessor's active consent. Without an explicit assignment clause, the lessor can effectively veto your ability to sell the remaining lease term — or use that consent as leverage on the exit price.",
      "The clause to seek: an express right to assign the remaining lease term to any third party without requiring prior lessor consent (or with consent not to be unreasonably withheld). Any assignment must also be registered at the Land Office — an unregistered assignment creates only a personal obligation and may not bind a new landowner or third party. For how the assignment clause affects exit planning and resale value, see [Selling your leasehold villa](/knowledge/selling-leasehold-villa-exit-liquidity).",
      { h: "Sublease rights: renting to tenants" },
      "Section 544 of the Civil and Commercial Code prevents the lessee from subleasing without the lessor's consent unless the lease explicitly permits it. For a villa you plan to rent out — even to long-stay tenants on monthly contracts — an express sublease clause is essential, or the landowner can claim you are in breach.",
      "Note the overlap with the Hotel Act: stays under 30 days require a hotel licence regardless of what the lease says about subleasing. The sublease clause matters most for 30-day-plus tenancies, which are legally straightforward. See [Renting out your villa](/knowledge/renting-out-your-villa-rules-and-taxes).",
      { h: "Right of first refusal on the land" },
      "This clause does not appear in most standard leases but is worth negotiating. If the landowner decides to sell the freehold during your tenancy, you receive the first option at the offered price before it goes to anyone else.",
      "Why it matters: a registered lease survives a sale of the land (the new buyer steps into the lessor's position for your remaining term), but the new landowner has no obligation to renew at year 30. A right of first refusal gives you a path to converting from leasehold to freehold if the land becomes available — and prevents the land moving to an unknown buyer whose relationship to you is untested.",
      { h: "Renewal: what can and cannot be promised" },
      "The March 2025 Supreme Court ruling (Case No. 4655/2566) settled this definitively: pre-agreed automatic renewal clauses for periods beyond the initial 30 years are void. Only the initial registered term is a property right. See [Renewing a 30-year lease](/knowledge/renewing-30-year-lease-risks) for the full legal background.",
      "What a contract can legitimately contain: a good-faith obligation on the current landowner to offer renewal at expiry, or a right of first refusal on the new lease term. These are contractual promises against the original lessor — they do not automatically bind a successor landowner and are not registrable property rights. Plan the purchase around the primary 30-year term; treat any renewal language as a bonus, not a guarantee.",
      { h: "Protecting you during the term" },
      {
        ul: [
          "**Prohibition on mortgaging or selling without consent**: not automatic — the lease must include this. Without it, the land can be mortgaged or sold during your tenancy. A registered lease survives a change of landowner, but an undisclosed mortgage on the land creates real risk if the landowner defaults and a lender enforces.",
          "**Quiet enjoyment**: the lessor may not interfere with your use of the property during the term — state it explicitly.",
          "**Maintenance division**: structural repairs are the lessor's responsibility under the CCC; day-to-day maintenance is the lessee's. Specify in the contract who handles disputed middle ground — pool equipment, roofing, shared access roads.",
          "**Compensation on early termination**: define what you receive if the lessor materially breaches. Without a specific clause, you are left to litigation to establish the amount and timeline.",
          "**Alterations and construction**: if you plan to build or extend, the lease must authorise it — and the construction permit (Por. Ror. 1) must be applied for with the landowner's written consent. See [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan).",
        ],
      },
      { h: "The building is a separate matter" },
      "The lease alone does not give you building ownership — it is occupancy of the land. Ownership of the villa itself must be secured by a separately registered superficies (สิทธิเหนือพื้นดิน) at the Land Office. That registration must appear on the back of the title deed, distinct from the lease registration. An unregistered superficies creates only a personal right between you and the original landowner and does not bind a future buyer of the land. See [Superficies, usufruct and lease](/knowledge/superficies-vs-usufruct-vs-lease) and [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      { h: "Practical requirements at registration" },
      "The lease must be in Thai for Land Office registration. Insist on a certified English translation alongside it — the Thai version governs, but you need to know what you signed. The registration endorsement appears on the back of the title deed, which the landowner keeps. Your documentary proof of the leasehold is the stamped registered lease copy — store it with the same care as a title deed.",
      "No developer's default draft will contain all of these protections. The review and negotiation stage — before you sign — is where to add them. Use an independent lawyer, not the developer's own lawyer; that independence is the point. Once a contract is signed and registered, adding protections that were not in it requires renegotiating the whole agreement. For where the lease review fits in the full purchase process, see [How to buy property on Koh Phangan step by step](/knowledge/how-to-buy-property-step-by-step).",
    ],
    takeaways: [
      "A Thai lease may not automatically pass to your heirs on death — a succession clause (or registered co-lessee) provides the certainty that is otherwise missing.",
      "Without an assignment clause, the lessor can block or delay your ability to sell the remaining lease term — negotiate this before signing.",
      "Section 544 of the CCC prevents subleasing by default; an express sublease clause is required if you plan to rent the property to tenants.",
      "Post March 2025 Supreme Court ruling (Case No. 4655/2566), pre-agreed automatic renewals beyond 30 years are void — plan around the primary registered term.",
      "Use an independent lawyer to review the draft; protective clauses generally cannot be added after the contract is registered.",
    ],
    sources: [
      {
        title:
          "Thai Civil and Commercial Code — Sections 537–571 (lease), Section 538 (registration), Section 540 (30-year cap), Section 544 (subleasing without permission)",
      },
      {
        title: "Integrity Legal — Selling, Assignment, or Sublease of Lease in Thailand",
        url: "https://www.legal.co.th/resources/thailand-real-estate-property-law/title/selling-assignment-or-sublease-lease-thailand/",
      },
      {
        title:
          "Siam Legal International — Supreme Court Ruling on Long-Term Leases in Thailand (March 2025, Case No. 4655/2566)",
        url: "https://www.siam-legal.com/thailand-law/supreme-court-ruling-on-long-term-leases-in-thailand/",
      },
      {
        title: "Lawyers for Expats Thailand — Thailand Property Guide for Foreign Investors",
        url: "https://www.lawyersforexpatsthailand.com/post/thailand-property-guide-for-foreign-investors",
      },
    ],
    faqHref: "/faq",
    faqCategory: "documents",
    faqQuestion: "What clauses must I check in a Thai leasehold property contract before signing?",
  },
  {
    slug: "buying-in-sri-thanu",
    kbId: "kb-0024",
    topic: "Phangan",
    title: "Buying property in Sri Thanu, Koh Phangan: who it suits, prices and what to expect",
    short:
      "Sri Thanu is Koh Phangan's wellness and long-stay community hub — the densest concentration of foreign residents on the island. It suits buyers who want to be part of an established expat community and whose rental model relies on monthly stays rather than nightly bookings. It is not the optimal choice for pure short-stay yield maximisation.",
    updated: "2026-06-19",
    body: [
      "Sri Thanu (Ban Sri Thanu) sits on the southwest coast of Koh Phangan, around 7 km north of the main ferry port at Thong Sala. It is the closest thing the island has to a settled residential neighbourhood — not a beach resort and not a tourist zone, but an area where yoga studios, organic cafés, a beach coworking space, medical services and an international community have built up over the better part of a decade. That character shapes who buys here, what sells and what yields.",
      { h: "The character of the area" },
      "Sri Thanu is the commercial and community core of what the island's long-stay foreign population calls the 'wellness belt' — the corridor running south from Haad Yao along the southwest coast. The area is anchored by a mix of residential streets, small businesses and wellness venues that have made it the primary draw for European and Israeli expats, digital nomads and long-stay wellness visitors who choose to base themselves on Koh Phangan permanently or for extended periods.",
      "Unlike Haad Rin to the south (Full Moon Party tourism), Thong Nai Pan to the northeast (secluded luxury villas) or Thong Sala (the island's commercial and administrative hub), Sri Thanu is the district you choose when you want to live in a community rather than a resort. The social infrastructure — coworking space (BeacHub, a member workspace directly on the beach), gyms, health food venues, regular community events — is real and established, not aspirational.",
      { h: "What is available to buy" },
      {
        ul: [
          "**Pool villas (1–3 bedrooms)** — the dominant category for foreign buyers. Most are garden or jungle villas rather than direct beachfront (Hin Kong beach is a short walk from the community core, but most properties are set back from the shore). Modern pool villas with Western-standard finishes are the main new-build product in the area.",
          "**Land plots** — flat and gentle-slope plots are available in and around the community core. The majority of Sri Thanu sits below 80 m elevation, keeping most plots out of the Zone 3(1) hillside restrictions that apply from 80 m upward under the 2025 environmental rules. This means more permissive build constraints than much of the elevated western coast — a practical advantage for a buyer who wants to develop. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
          "**Condominiums** — Sri Thanu and the adjacent Haad Yao area host Koh Phangan's highest concentration of condominium projects: four active projects totalling roughly 66 units, valued at approximately THB 380 million. This is the part of the island where a foreign buyer is most likely to find a freehold condo unit within the 49% foreign-ownership quota.",
        ],
      },
      { h: "Typical prices" },
      "Land in Sri Thanu currently runs roughly **THB 3–5 million per rai**, varying with proximity to the beach, sea view, road access and title class. The west coast overall has seen 2–4× appreciation since early 2022, driven by community-driven demand; Sri Thanu sits within this trend. Plots with registered road access and a Chanote title command the upper end of the range. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3) and [How land is priced](/knowledge/how-land-is-priced-price-per-rai) for context on what drives price differences.",
      "Completed pool villas typically range from roughly **THB 8–20 million** for one to three bedrooms on a leasehold basis, with larger or premium-finish properties higher. Condominiums start at around THB 3–5 million for a one-bedroom. Off-plan entry prices are generally 15–25% below the completed comparable — with the developer and completion risk that entails. See [Buying off-plan on Koh Phangan](/knowledge/buying-off-plan-new-developments).",
      "All villa and land purchases by foreign buyers in Sri Thanu are structured as leasehold — a 30-year registered land lease combined with ownership of the building through a registered superficies. Condominium freehold is available within the 49% foreign quota. See [Leasehold vs freehold](/knowledge/leasehold-vs-freehold) and [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      { h: "The rental case" },
      "Sri Thanu's natural tenant base is long-stay: wellness retreat visitors, digital nomads and expats typically renting for one to three months at a time. That stay profile lines up well with the Hotel Act's licensing boundary — lets of 30 days or more sit outside the hotel-licence requirement that applies to stays under 30 days. For an owner who wants steady rental income without navigating short-stay licensing, Sri Thanu's tenant demographic is a practical advantage.",
      "Monthly villa rents in the area typically run **THB 25,000–70,000** depending on size, specification and season. The dry season (November–April) is high-occupancy; May to October is the wet season and demand softens. A realistic net-yield model runs nightly rate (or monthly equivalent) times occupancy, minus management costs (typically around 25% of gross), maintenance and annual property tax. See [Renting out your villa](/knowledge/renting-out-your-villa-rules-and-taxes) for the full calculation.",
      { h: "What to verify when buying here" },
      "Standard due diligence applies everywhere on the island — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan). A few points specific to Sri Thanu:",
      {
        ul: [
          "**Title class**: the area has a mix of Chanote and Nor Sor 3 Gor titles. Both are workable with proper verification; confirm the class and condition before making an offer.",
          "**Road access**: properties off secondary or unpaved roads — particularly on hillside land above the main community core — need registered rights of way confirmed. Verbal access is one of the most common traps on the island.",
          "**Elevation**: most of the Sri Thanu commercial area sits below 80 m. Some hillside land above the valley floor may cross into Zone 3(1) restrictions (6 m height cap, 50% green space minimum). Check the specific plot's elevation before you commit to a build.",
          "**Utilities**: mains water and electricity are available in the main community area; confirm meter registration and water source for the specific property. Reliability on secondary roads and newer developments can vary.",
          "**Neighbouring development**: given the density of new-build activity since 2022, confirm whether adjacent vacant plots already carry permits that could affect sea views or privacy.",
        ],
      },
      { h: "Who Sri Thanu is not the optimal choice for" },
      "If the primary goal is maximising short-stay rental yield, a beachfront property or a premium hillside villa in Haad Yao (north) or Thong Nai Pan commands higher nightly rates from tourism-oriented guests — at the cost of requiring a hotel licence for stays under 30 days. For a buyer whose priority is total privacy and seclusion, the community density of Sri Thanu works against them. And for someone primarily motivated by sea views from the property itself, the Sri Thanu core is mostly garden and valley rather than elevated sea-view hillside; look to Haad Yao immediately north for that.",
      "Sri Thanu is the right choice for a buyer who wants to be part of Koh Phangan's most established foreign community, who values proximity to wellness and co-working culture, and whose investment approach suits long-stay tenants rather than short-vacation bookings. It is the most neighbourhood-like district on the island — and that is both its appeal and its constraint.",
    ],
    takeaways: [
      "Sri Thanu is Koh Phangan's established wellness and long-stay community hub — the highest-density expat and digital-nomad area on the island, with real social infrastructure.",
      "Land prices typically run THB 3–5 million per rai; completed pool villas from roughly THB 8–20 million (leasehold); condominiums from around THB 3–5 million.",
      "Most of Sri Thanu sits below 80 m elevation, keeping the majority of plots outside the tightest Zone 3(1) hillside construction restrictions of the 2025 environmental rules.",
      "The natural tenant base of monthly-stay wellness visitors and digital nomads aligns well with the Hotel Act — long lets require no hotel licence, simplifying the rental model.",
      "For short-stay yield maximisation or sea-view hillside properties, neighbouring Haad Yao to the north is likely a stronger fit.",
    ],
    sources: [
      {
        title:
          "Nation Thailand — Israel, Europe and Australia Anchor in Koh Phangan, Driving Property Investment Past THB7.9bn",
        url: "https://www.nationthailand.com/business/property/40067434",
      },
      {
        title: "Digital Nomad World — Digital Nomad Guide to Koh Phangan 2025",
        url: "https://digitalnomads.world/city-guide/ko-pha-ngan/",
      },
      {
        title: "Nestopa — Digital Nomad Guide for Koh Phangan (BeacHub coworking)",
        url: "https://nestopa.com/th-en/articles/digital-nomad-guide-for-koh-phangan",
      },
      {
        title: "Koh Phangan Homes — Sri Thanu area listings and land prices",
        url: "https://phanganlandandhome.com/area/sri-thanu/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "What is it like to buy property in Sri Thanu on Koh Phangan, and who is it best for?",
  },
  {
    slug: "buying-in-thong-sala",
    kbId: "kb-0025",
    topic: "Phangan",
    title: "Buying property in Thong Sala, Koh Phangan: the island's practical hub",
    short:
      "Thong Sala is Koh Phangan's main town, ferry port and commercial centre — the right choice for buyers who prioritise year-round rental demand and service infrastructure over beachfront lifestyle. Lower entry prices than the west coast, stable demand, and the island's best transport links trade against an urban rather than resort character.",
    updated: "2026-06-20",
    body: [
      "Thong Sala is Koh Phangan's capital in practice: the main ferry port, the commercial hub, and the concentration point for the island's banks, hospitals, schools, supermarkets and administrative offices. Sitting on the southwest coast roughly 7 km south of Sri Thanu, it is where everything the island needs arrives — and where the island's day-to-day business gets done. That character makes it a different kind of property choice from the wellness belt or the beachfront areas.",
      { h: "What the area offers" },
      {
        ul: [
          "**Ferry port** — Thong Sala Pier is the main gateway for routes to Surat Thani on the mainland, Koh Samui and Koh Tao. The daily flow of goods, workers and visitors makes this the island's most connected location.",
          "**Services hub** — within a short radius: Bangkok Bank, Kasikorn and SCB branches; the island's main hospital (Koh Phangan Hospital); Makro (~1.5 km), Big C and international pharmacies; hardware stores, dental and medical clinics, and government offices.",
          "**Night market and dining** — the Thong Sala Walking Street night market operates weekly; restaurants, bars and international food options are concentrated here and open year-round, not just in high season.",
          "**Commercial zoning** — parts of Thong Sala carry a commercial designation, creating flexible options for ground-floor business use alongside residential — relevant for investors who want a mixed-use or shop-house product.",
        ],
      },
      "What Thong Sala is not: a beachfront location. The nearest swimmable beach is roughly 1 km from the town centre, and this part of the island does not offer the west-coast sea views or the wellness-community character of Sri Thanu. Buyers who want to live in the middle of the island's practical life choose Thong Sala; buyers who want to live on a beach choose elsewhere.",
      { h: "What is available to buy" },
      {
        ul: [
          "**Villas and houses** — a mix of older Thai houses, renovated properties and new small villa developments. Entry price is lower than the western coast. Recent developments near Thong Sala offer units from roughly ฿2.8–6.2 million for 56–215 sqm. The premium ceiling in this area is below that of beachfront or elevated sea-view locations elsewhere.",
          "**Condominiums and apartments** — Thong Sala and adjacent Ban Tai have some apartment-block stock designed for the long-stay rental market. Freehold condominium units within the 49% foreign-ownership quota are less concentrated here than in the Sri Thanu/Haad Yao corridor.",
          "**Land plots** — commercial and residential plots around the town. Most of Thong Sala sits at low elevation with no hillside-zone restrictions under the 2025 environmental rules. Check road access and utilities on any plot — urban does not automatically mean connected. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
          "**Adjacent Ban Tai** — the beach strip immediately south of Thong Sala has flat coastal land, some with Chanote title and genuine beach proximity. Ban Tai together with Thong Sala forms what investors call the island's logistical backbone; Ban Tai plots add a coastal dimension the town centre itself does not offer.",
        ],
      },
      { h: "Prices and value positioning" },
      "Thong Sala sits at the accessible end of the Koh Phangan market. Median property prices in the Thong Sala/Ban Tai zone run around ฿26.5 million — a figure skewed upward by larger villa developments. Entry-level apartments and smaller villas are substantially below that. Per-sqm values average around ฿37,000, below the premium of sea-view hillside or beachfront product on the western coast.",
      "That lower entry cost reflects the character trade-off: urban convenience rather than lifestyle resort. For yield-focused investors, a lower purchase price can improve the arithmetic on net yield, particularly when the rental model relies on steady year-round occupancy rather than peak-season nightly rates. For general context on how land is priced and what moves value on the island, see [How land is priced on Koh Phangan](/knowledge/how-land-is-priced-price-per-rai).",
      { h: "The rental case" },
      "Thong Sala's rental demand is year-round rather than seasonal, and driven by a different tenant base from the wellness belt: island workers, medical-visit stays, service-sector professionals, short-term visiting families and budget-conscious long-stay foreigners who want town convenience more than a beach. Monthly rents for a well-positioned studio or one-bedroom apartment run roughly ฿8,000–20,000; for a two- to three-bedroom house or villa closer to ฿20,000–45,000.",
      "The year-round nature of demand is a meaningful advantage over purely tourism-driven rental locations that soften in the May–October wet season. For the tax and legal framework on renting out, see [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
      { h: "Liquidity and exit" },
      "Thong Sala properties tend to be more liquid than remote hillside or jungle villas, because a wider buyer base — Thai nationals, long-stay foreigners, service-sector investors and small-business operators — can use them. Lower price points also expand the pool. That said, the absence of a beach or sea view caps the price ceiling: a leasehold villa in Thong Sala commands a lower exit price per sqm than equivalent product on the western sea-view corridor. Plan the exit around realistic comparable sales, not the upper tier of the island market. For the mechanics of selling a leasehold, see [Selling your leasehold villa](/knowledge/selling-leasehold-villa-exit-liquidity).",
      { h: "What to verify when buying here" },
      "Standard due diligence applies throughout the island — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan). Points specific to Thong Sala:",
      {
        ul: [
          "**Title class** — a mix of Chanote and Nor Sor 3 Gor titles exists in the area. Confirm the class and verify the deed against the Land Office record before committing. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Road access** — even in the town area, secondary and unpaved roads exist. Confirm a registered right of way to the public road; landlocked plots are not limited to the hillside.",
          "**Permitted commercial use** — if the property is in a commercially-zoned area and you plan business use, verify the permitted use matches the plan. Hotel licences, liquor licences and food-service permits each have their own requirements.",
          "**Utilities** — mains water and electricity are generally available in main Thong Sala; verify meter registration on the specific property. For plots slightly off the main road or in newer developments, confirm supply rather than assuming it. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
          "**Building permits** — for existing structures, check that the construction permit (Por. Ror. 1) exists and the building matches the approved plans. Older Thong Sala stock may have unpermitted additions; these become the buyer's problem at transfer. See [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan).",
        ],
      },
      { h: "Who Thong Sala suits — and who it does not" },
      "Thong Sala is for the buyer who prioritises practicality, service access or yield over lifestyle-resort character. It works well for: an investor who wants a well-occupied rental that does not depend on peak-season tourism; a business operator who needs proximity to the island's commercial core; or a buyer who values ferry connections, hospitals and banks over a sea view.",
      "It is not the right choice for someone whose vision of island living centres on beach proximity, sunset views or the wellness community. For that, [Sri Thanu](/knowledge/buying-in-sri-thanu) (the wellness-community hub, 7 km north) is the most comparable alternative. For premium hillside sea-view product, the Haad Yao and Haad Salad corridor to the north offers that tier.",
    ],
    takeaways: [
      "Thong Sala is Koh Phangan's ferry port and commercial hub — banks, hospital, supermarkets, admin — not a beachfront area.",
      "Entry prices are lower than the west coast; newer small villa developments start around ฿2.8–6.2 million; median for the zone is roughly ฿26.5 million.",
      "Rental demand is year-round from workers and service tenants, not seasonal-tourist-dependent — a meaningful stability advantage.",
      "Low elevation means no 2025 hillside-zone restrictions, but road access and utility connections still require individual verification.",
      "For beach proximity, wellness community or sunset views, Sri Thanu (north) or Ban Tai beachfront (south) are stronger fits.",
    ],
    sources: [
      {
        title: "Samui Phangan Real Estate — Koh Phangan real estate market overview",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-real-estate-market/",
      },
      {
        title: "Keller Henson — Phangan Tropical Villas Thong Sala (project overview)",
        url: "https://kellerhenson.com/project/phangan-tropical-villas-thong-sala/",
      },
      {
        title:
          "Nation Thailand — Israel, Europe and Australia Anchor in Koh Phangan, Driving Property Investment Past THB7.9bn",
        url: "https://www.nationthailand.com/business/property/40067434",
      },
      {
        title: "Estate Samui Properties — Koh Phangan Guide for Property Buyers",
        url: "https://www.estate-samui-properties.com/koh-phangan-guide-for-property-buyers/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Thong Sala on Koh Phangan like as a property area, and who should buy there?",
  },
  {
    slug: "utilities-water-electricity-internet-koh-phangan",
    kbId: "kb-0026",
    topic: "Phangan",
    title: "Utilities on Koh Phangan: water, electricity, internet and road access",
    short:
      "Island utilities are more variable than on the mainland, and two adjacent plots can have entirely different supply sources, reliability and running costs. Verify every utility against documentary evidence during due diligence — not after signing.",
    updated: "2026-06-20",
    body: [
      "Utilities on Koh Phangan are not a given. Government mains water covers the main developed areas but the island has a chronic supply shortfall. Power is improving with a major submarine cable upgrade underway, but outages during peak season remain a known reality. Internet is workable in populated areas via 4G but limited compared to the mainland. And road access — which affects every other utility — ranges from the sealed ring road to steep unpaved tracks that become impassable in monsoon. Understanding a specific plot's utility situation is part of due diligence, not an afterthought.",
      { h: "Water: the most variable utility" },
      "Koh Phangan has a structural water shortage. The Royal Irrigation Department has established that annual water demand on the island is approximately 600,000 cubic metres — roughly double the available supply. Drought conditions have been officially declared during dry periods, with tap water rationed on parts of the island. Provincial waterworks mains coverage is concentrated in Thong Sala and the larger developed communities; coverage thins rapidly on hillside and remote plots.",
      {
        ul: [
          "**Government main (Provincial Waterworks Authority)** — available in Thong Sala and the main established communities. Pressure and reliability can vary seasonally; supply cuts are possible in the dry season (November–April). Verify that the specific property has a registered meter and live account, not merely that a main passes nearby.",
          "**Private well or borehole** — common on land plots away from main roads and on hillside properties. The island's granite and sandstone geology can hold groundwater, but yield and quality vary significantly by location. Have any existing well tested for yield and potability before relying on it as the primary supply.",
          "**Rainwater collection tanks** — roof-catchment systems supplement or replace mains supply on some properties. Practical in the wet season (May–October); in the dry season a stored-water arrangement is needed.",
          "**Tanker delivery** — plots without a well or mains connection receive water by truck. It functions, but it is a running cost and a supply dependency that should be confirmed and factored into holding costs before purchase.",
        ],
      },
      "The Royal Irrigation Department is in the Environmental Impact Assessment stage of a 400 million baht subsurface dam project — the first of its kind in Thailand, based on Japan's Miyako Island model — designed to increase groundwater storage and address the structural deficit. Until this project is built, every non-mains plot should be assumed to require a verified alternative supply.",
      { h: "Electricity: PEA connection and the upgrade underway" },
      "Power is supplied by the Provincial Electricity Authority (PEA). The island currently receives electricity through four ageing submarine cable circuits — two at 115 kV and two at 33 kV — with a total design capacity of approximately 174 MW. Partial faults and capacity shortfalls during peak tourist season (November–April) are a known feature of island electricity supply.",
      "A major upgrade is under construction. In February 2023, the Cabinet approved an EGAT project to install two 230 kV submarine cable circuits from Khanom Substation on the mainland to a new substation on Koh Samui — 50 km in total — adding 400 MW of transmission capacity (200 MW per circuit) to the wider island group that includes Koh Phangan and Koh Tao. When complete, this substantially upgrades grid stability and available capacity for all three islands.",
      {
        ul: [
          "**In developed areas and near main roads** — a PEA meter connection is standard. Verify that the meter is registered to the specific property (not a shared meter with a landlord), and note whether the supply is single-phase or three-phase — relevant if you plan a pool pump or high-load equipment.",
          "**On remote or hillside plots** — electricity may require a transformer extension at additional cost and with a lead time. Request evidence of an active, registered PEA meter at the plot address, not just assurance that 'electricity is nearby.'",
          "**Solar** — increasingly used on new villas as a supplement or primary supply. Grid-tied systems require PEA approval; off-grid solar with battery storage is a practical alternative for remote plots where grid connection is delayed or expensive.",
        ],
      },
      { h: "Internet and mobile connectivity" },
      "Internet access in Koh Phangan's main communities is workable for most remote workers, but is substantially behind mainland Thailand in speed and reliability. Following the 2023 merger of DTAC and TrueMove H, the two providers are now AIS and True Corporation.",
      {
        ul: [
          "**4G mobile data** — the primary internet for most island residents. AIS has marginally better island coverage than True. Coverage is reliable in Thong Sala, Sri Thanu, Haad Rin and the main western-coast communities. Interior and remote plots have patchy signal; physically check the signal at the specific plot with your intended SIM before buying to build.",
          "**Fixed broadband** — available in parts of the main developed areas, but speeds and consistency are well below the 200–1,000 Mbps fibre standard available in Bangkok and major Thai cities. Plan around 4G as the primary connection, with fixed broadband as a backup where available.",
          "**Congestion** — Full Moon Party nights in Haad Rin bring 10,000–30,000 people to a small area and severely overload both networks. Island-wide, all connections face higher loads in high season (November–April). Plan production-critical work around off-peak hours.",
          "**Coworking** — venues such as BeacHub in Sri Thanu provide business-grade internet connections for members, effectively bypassing residential connectivity limitations for office hours.",
        ],
      },
      { h: "Road access: the utility that determines all the others" },
      "A plot with power, water and internet but no legally confirmed road access is effectively unusable. Road quality on Koh Phangan ranges from the sealed main ring road to steep concrete hillside paths to unpaved jungle tracks that become impassable in the wet season.",
      {
        ul: [
          "**Main ring road** — the sealed perimeter road is well-maintained and year-round passable. Properties directly on or close to it have reliable access.",
          "**Concrete secondary roads** — most established communities have concrete roads, generally usable in all seasons but subject to cracking, level drops and steep gradients on hillside approaches.",
          "**Unpaved tracks** — particularly to remote hillside and interior plots. Passable in the dry season; some become mud channels in the wet season. Verify the condition in person during or after heavy rain, not only on a dry-day visit.",
          "**Registered right of way** — the critical legal point. A visible track, a verbal agreement or a gentleman's understanding is not a protected legal right. The road access to the public road must be registered on the title deed as a servitude; without it, a new owner of any connecting plot can block access. See [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan).",
        ],
      },
      { h: "What to verify before you commit" },
      "Each utility must be confirmed against documentary evidence — not a seller's assurance.",
      {
        ul: [
          "**Water** — request the Provincial Waterworks account number and meter reference for the property, or a well-yield and quality test report, or the written supply arrangement if water comes from a shared tank or delivery service.",
          "**Electricity** — request the PEA account number and meter serial number registered to the plot address. Confirm supply phase (single-phase or three-phase) if relevant to your planned use.",
          "**Internet** — test 4G signal at the specific plot with the SIM of your preferred provider. For an existing building, check whether fibre or ADSL termination is physically present at the address.",
          "**Road** — walk the complete route from the public road to the plot. Have your lawyer confirm a registered right of way on the title deed — not merely a track you can see.",
        ],
      },
      "Utilities are not glamorous, but they are what makes a plot liveable and determine running costs for the life of ownership. A plot with government mains water, a registered PEA meter and sealed concrete road access is a meaningfully different asset from one that relies on tanker delivery, a distant transformer and an unregistered track.",
    ],
    takeaways: [
      "Koh Phangan water demand is roughly double available supply — confirm whether a plot has mains connection, a tested well, or a tank/delivery arrangement before you buy.",
      "PEA power is currently supplied through ageing 115/33 kV submarine cables; a major EGAT 230 kV cable upgrade (400 MW capacity) serving the island group is under construction but not yet complete.",
      "Internet: AIS 4G is the primary reliable connection for most island residents; fixed broadband exists in some main areas but at lower speeds than mainland Thai cities.",
      "All three utilities are less reliable on hillside and remote plots — check signal, meter registration and supply evidence at the actual location, not the nearest main road.",
      "Road access must be a registered servitude on the title deed — a visible track or verbal agreement is not a legally protected right.",
    ],
    sources: [
      {
        title:
          "Koh Phangan Island News — Koh Phangan subsurface dam to address freshwater shortage",
        url: "https://kohphangannews.org/general-news/koh-phangan-subsurface-dam-to-address-freshwater-shortage-2077.html",
      },
      {
        title:
          "EGAT — 230 kV Submarine Cables Connect Ko Samui to a Sustainable Future of Energy",
        url: "https://www.egat.co.th/home/en/230-kv-submarine-cables-connect-ko-samui-to-a-sustainable-future-of-energy/",
      },
      {
        title: "Koh Phangan Island News — Koh Phangan tourist island declared drought zone",
        url: "https://kohphangannews.org/high-alert/koh-phangan-tourist-island-declared-drought-zone-1826.html",
      },
      {
        title:
          "Koh Phangan Island News — Ways sought to improve Koh Phangan's infrastructure problems (May 2024)",
        url: "https://kohphangannews.org/general-news/ways-sought-to-improve-koh-phangans-infrastructure-problems-4596.html",
      },
      {
        title:
          "eSIM Thailand Network Guide 2026 — AIS vs True Corp island signal coverage",
        url: "https://esimy.net/best-esim-for-thailand-2026-complete-network-coverage-island-guide/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What are the utilities like on Koh Phangan — water, electricity, internet and road access?",
  },
  {
    slug: "owners-taxes-annual-land-and-income",
    kbId: "kb-0027",
    topic: "Costs",
    title: "Owner's taxes on Koh Phangan: Land & Building Tax and rental income tax",
    short:
      "Two taxes run alongside owning property on Koh Phangan: the annual Land and Building Tax (assessed by the local authority on the official appraised value) and personal income tax on any rental income. For most foreign leasehold holders the Land and Building Tax is legally the landowner's liability, not yours — but rental income is taxed in your hands regardless of residency status.",
    updated: "2026-06-21",
    body: [
      "Owning property in Thailand means two annual tax obligations. The Land and Building Tax (LBT) is a local property tax introduced under the Land and Building Tax Act B.E. 2562 (2019) and collected by the local administrative authority. Personal Income Tax on rental income flows to the Revenue Department. How each applies to you depends on how you hold the property — leasehold villa or freehold condominium — and how many days a year you spend in Thailand.",
      { h: "Who actually pays the Land and Building Tax on a leasehold" },
      "The LBT is assessed on the registered owner of the land or building — the person whose name appears on the title deed. For a foreign buyer holding a **leasehold villa**, the land title stays in the Thai landowner's name throughout the lease. That means the LBT falls on the landowner, not on you as lessee, as a matter of law. Your lease contract may or may not pass this cost through to you — check the wording. For a **freehold condo unit**, you are the registered owner and you pay the LBT yourself. For both, the tax base is the government's official appraised value, not the market price — appraised values on Koh Phangan run well below transaction prices.",
      { h: "2026 rates by property category" },
      "2026 is the first full-rate year without a pandemic-era across-the-board government discount. Tax is assessed and collected by the local Subdistrict Administrative Organisation (OrBorTor) on Koh Phangan.",
      {
        ul: [
          "**Primary residence, land and building combined** — first ฿50 million of appraised value: exempt. ฿50–75M: 0.03%. ฿75–100M: 0.05%. Over ฿100M: 0.10%.",
          "**Primary residence, building only (e.g., condo you own but not the land)** — first ฿10 million: exempt. ฿10–50M: 0.02%. ฿50–75M: 0.03%. ฿75–100M: 0.05%. Over ฿100M: 0.10%.",
          "**Second or additional homes** — no exemption threshold. ฿0–50M: 0.02%. ฿50–75M: 0.03%. ฿75–100M: 0.05%. Over ฿100M: 0.10%.",
          "**Rented residential or commercial use** — 0.30% to 0.70% of appraised value (rising with value in bands).",
          "**Vacant or unused land** — same 0.30–0.70% range, with an escalator: each consecutive three-year period of vacancy adds a further 0.30%, capped at 3% total. Land left unused for six or nine years faces a sharply higher effective rate.",
        ],
      },
      "**Practical note on condos:** A condo unit appraised at ฿5 million used as a primary residence is entirely inside the ฿10 million exemption threshold — LBT is ฿0. A similar unit rented out falls under the 0.30% commercial/rented rate: ฿15,000 per year. That difference is the clearest illustration of why rented property carries a meaningfully higher LBT burden than owner-occupied.",
      "Payment deadline for the 2026 assessment year was extended by the Ministry of Interior to June 2026 (normally April). Bills of ฿3,000 or more may be paid in instalments across June–August.",
      { h: "Income tax on rental income" },
      "Rental income from Thai property is subject to Thai Personal Income Tax (PIT) regardless of whether you are a Thai tax resident or not. The Revenue Department allows a **30% standard deduction** on gross rental income from buildings and wharves — no itemisation needed. After that deduction, the remaining 70% is added to other Thai-source income and taxed at progressive rates:",
      {
        ul: [
          "฿0–150,000 — **exempt**",
          "฿150,001–300,000 — **5%**",
          "฿300,001–500,000 — **10%**",
          "฿500,001–750,000 — **15%**",
          "฿750,001–1,000,000 — **20%**",
          "฿1,000,001–2,000,000 — **25%**",
          "฿2,000,001–4,000,000 — **30%**",
          "Over ฿4,000,000 — **35%**",
        ],
      },
      "These rates have been in place since 2013. Personal allowances (personal deduction, spousal, dependent child, insurance) reduce taxable income further for residents filing annually.",
      { h: "Resident vs. non-resident treatment" },
      "You are a Thai tax **resident** if you spend 180 or more days in Thailand during a calendar year. Residents are taxed on Thai-source income and on foreign income remitted to Thailand in the year it is earned. **Non-residents** are taxed only on Thai-source income — including rental income from a Thai property — at the same progressive rates. For non-residents, the tenant or payer may be required to withhold 15% of the rental payment at source and remit it to the Revenue Department; the non-resident can then file an annual return and claim a refund if the withholding exceeded the actual PIT liability (since the 30% deduction reduces the net taxable amount below what the withholding assumes).",
      "The 2025 changes to the Revenue Department's rules on foreign-sourced income remittances affect residents who remit offshore income to Thailand — they do not change the position on Thai-source rental income, which has always been taxable regardless of remittance.",
      { h: "Filing and compliance" },
      {
        ul: [
          "**Land and Building Tax** — assessed and notified by OrBorTor (Koh Phangan's local administrative bodies) annually, typically January–April. Payment deadline: June 2026 (extended year). No self-assessment; you receive a notice.",
          "**Personal Income Tax on rental income** — annual return (Por. Ngor. Dor. 90 for mixed income, or Por. Ngor. Dor. 91 for salary-only) filed with the Revenue Department by 31 March of the following year. A Thai tax ID number from the Revenue Department is required. Non-residents can also file online.",
          "**Management commission**, maintenance costs and professional fees are not deductible under the standard 30% deduction method — but the 30% flat rate is simpler and usually more advantageous than itemising actual expenses for a typical villa.",
        ],
      },
      "Right Way does not file taxes for clients. Use a Thai accountant for both LBT compliance and PIT returns. For the taxes that arise at purchase and at sale, see [The full cost of buying on Koh Phangan](/knowledge/cost-of-buying-taxes-and-fees). For the rental income framework, including the Hotel Act licensing requirement for stays under 30 days, see [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
    ],
    takeaways: [
      "For a leasehold villa, the Land and Building Tax falls on the Thai landowner (the registered title holder) by law — check your lease to see if it passes the cost to you.",
      "For a freehold condo used as a primary residence with an appraised value under ฿10M, Land and Building Tax is typically ฿0 — entirely within the exemption threshold.",
      "Rented or commercially used property faces 0.30–0.70% LBT, well above the owner-occupied residential rate.",
      "Rental income is taxed at progressive PIT rates of 5–35% after a 30% standard deduction on gross rent from buildings — both residents and non-residents.",
      "2026 is the first full-rate LBT year without a government-wide discount; the payment deadline for the 2026 year has been extended to June 2026.",
    ],
    sources: [
      {
        title: "Thailand Land and Building Tax Act B.E. 2562 (2019) — rates, exemptions, local administrative body assessment (general practice)",
      },
      {
        title: "Revenue Department of Thailand — Personal Income Tax rates and rental income deduction (rd.go.th)",
        url: "https://www.rd.go.th/english/6045.html",
      },
      {
        title: "Lex Bangkok — New Land and Building Tax Thailand 2026 (B.E. 2569): Full Guide",
        url: "https://lexbangkok.com/land-building-tax-thailand-2026/",
      },
      {
        title: "HLB Thailand — Thai Rental Properties and Personal Income Tax 2026",
        url: "https://www.hlbthai.com/thai-rental-properties-and-personal-income-tax-2/",
      },
      {
        title: "Dan Siam Property — Thailand Land and Building Tax Full Enforcement 2026",
        url: "https://dansiam-property.com/thailand-land-building-tax-full-enforcement-2026-property-investor-guide/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion: "What annual taxes does a foreign property owner pay on Koh Phangan?",
  },
  {
    slug: "visa-residency-property-owner-koh-phangan",
    kbId: "kb-0028",
    topic: "Phangan",
    title: "Visa and residency for property owners on Koh Phangan: what a purchase gives you",
    short:
      "Buying a leasehold villa or land on Koh Phangan does not come with any visa or right to stay in Thailand. The four main long-stay routes — Thailand Elite, Retirement (O-A), LTR and DTV — each suit a different buyer profile. The one program that ties residency directly to property ownership (the THB 3M investment visa) only accepts freehold condominiums, not leaseholds.",
    updated: "2026-06-21",
    body: [
      "The first thing to understand is what a property purchase on Koh Phangan does not give you: a visa, a right of residency, or any change to your immigration status. Owning a leasehold villa or a plot of land in Thailand confers property rights — a registered lease, building ownership, a superficies — but zero immigration benefit. If you plan to spend significant time in Thailand after buying, you need to choose a visa route through a separate channel, and that choice depends on your age, income, work plans and how many months a year you expect to be here.",
      { h: "The one property-linked route — and why it doesn't apply to most Phangan buyers" },
      "Thailand operates a **Non-Immigrant B (Investment) visa pathway** for foreigners who purchase a freehold condominium valued at ฿3 million or more and registered in their name at the Department of Lands. This converts the condo purchase into a 1-year renewable right to stay (extendable annually as long as the condo is held). It is the only Thai immigration pathway that formally links property ownership to residency status.",
      "For most foreign buyers on Koh Phangan, this route is not available. Villa and land purchases here are structured as leasehold — a registered land lease plus ownership of the building — not as freehold property in the buyer's name. The ฿3M investment pathway explicitly requires freehold condo registration. Leasehold villas and the rental-agreement route (฿85,000/month long-term lease) are currently suspended pending regulatory revision. For why leasehold is the standard structure on Phangan, see [Leasehold vs freehold on Koh Phangan](/knowledge/leasehold-vs-freehold).",
      "The Phangan condo market is small — around 66 units across four active projects in the Sri Thanu/Haad Yao corridor. Foreign buyers who specifically want to use a condo purchase to anchor a visa should confirm the project is within the 49% foreign-ownership quota before buying. For everyone else — villa buyers and land investors — a visa must be arranged independently.",
      { h: "The four main long-stay options" },
      { h: "1. Thailand Elite (Privilege Entry Visa)" },
      "The Thailand Elite programme — now officially the Privilege Entry Visa — is the most straightforward option for a buyer who has no income requirements or age constraints to meet. Membership comes in three tiers:",
      {
        ul: [
          "**5 years** — ฿900,000 membership fee",
          "**10 years** — ฿1,500,000",
          "**20 years** — ฿2,500,000",
        ],
      },
      "Each entry allows 180 days' stay, extendable by another 180 days at an immigration office without leaving Thailand. No income verification, no health insurance mandate, no age minimum, no investment in Thailand required. VIP airport reception and immigration facilitation are included. The visa does not include work rights — a separate work permit is needed for any employment — and carries no special tax treatment. It suits buyers who want simplicity: pay once, arrive whenever, extend in-country.",
      { h: "2. Retirement Visa (Non-Immigrant O-A / O-X)" },
      "The retirement visa is the classic long-stay route for buyers aged 50 and over. Requirements for the O-A (annual renewal):",
      {
        ul: [
          "**Age 50+** on the date of application.",
          "**Financial**: ฿800,000 held in a Thai bank account for at least two months before first application and maintained throughout the year (raised to 3 months before annual renewal); or ฿65,000/month verifiable income; or a combination totalling ฿80,000/month.",
          "**Health insurance**: minimum ฿40,000 outpatient and ฿500,000 inpatient coverage per year (effectively available through most international health insurance products; many providers now require ฿3M+ inpatient in practice).",
          "**No criminal record** in home country (police clearance) and clean Thai immigration history.",
        ],
      },
      "The O-A visa is issued for one year and renewed annually. The O-X variant provides 5-year multiple-entry with annual in-country reporting. Both prohibit employment of any kind. No special tax benefits. The key advantage is cost: for someone who already holds ฿800,000 in a Thai bank or has a qualifying pension income, it is the most economical long-stay route. The key constraint: the 90-day reporting obligation (report to immigration every 90 consecutive days in-country) applies throughout.",
      { h: "3. LTR Visa (Long-Term Resident)" },
      "The Board of Investment's Long-Term Resident Visa provides a 10-year renewable stay and is the most powerful option for high-income buyers. It comes in four categories:",
      {
        ul: [
          "**Wealthy Global Citizen**: $80,000/year personal income AND $500,000 invested in Thailand (qualifying assets include property, Thai government bonds and Thai equities).",
          "**Wealthy Pensioner** (age 50+): $80,000/year passive income, OR $40,000/year income plus $250,000 Thai investment.",
          "**Work-from-Thailand Professional**: $80,000/year income from an overseas employer (or $40,000 with a master's degree or IP); employer must have been in business 3+ years.",
          "**Highly Skilled Professional**: employment in a specific qualifying sector with a salary of $80,000/year.",
        ],
      },
      "LTR benefits include: a digital work permit allowing remote work for overseas clients, **17% flat income tax on Thai-source employment income** (well below the progressive rate for high earners), exemption from 90-day reporting, and four family members can be added as dependants. The Thai investment of $250,000–500,000 required for some tracks can be structured into real property under specific BOI guidance — however, the investment must comply with BOI conditions and is distinct from simply purchasing a leasehold villa. Get specialist advice before treating a property purchase as the LTR investment component.",
      { h: "4. DTV (Destination Thailand Visa)" },
      "Launched in 2024, the DTV is Thailand's first visa formally designed for remote workers and digital nomads. It is available to any age group with no property requirement:",
      {
        ul: [
          "**Validity**: 5 years, multiple-entry.",
          "**Stay per entry**: 180 days, extendable by a further 180 days in-country (giving up to 360 days in Thailand per visit before needing to re-enter).",
          "**Financial**: $16,500/year verifiable income or $13,000 in savings.",
          "**Work rights**: explicitly authorises remote work for overseas employers and overseas clients — the first Thai visa to do so.",
          "**Tax**: standard Thai tax residency rules apply (resident if 180+ days in Thailand per year).",
        ],
      },
      "The DTV suits a buyer who is a remote worker, does not need to employ Thai staff, and wants maximum flexibility without a large upfront fee. Standard Thai personal income tax rules mean that spending 180+ days in Thailand makes you a resident and potentially taxable on Thai-source income and remitted foreign income — take tax advice if you plan to spend close to or over the threshold.",
      { h: "Permanent residency and citizenship" },
      "Thailand allows applications for permanent residence after three consecutive years on an appropriate non-immigrant visa (O, B or LTR), subject to annual quota limits and an application window in the last quarter of each year. Property ownership is not a qualifying factor. Thai citizenship is available after 10 years of permanent residence; the process is lengthy and discretionary. Neither pathway is realistically accessible to most property buyers in the short to medium term.",
      { h: "Practical planning: get the visa before you need it" },
      "The common mistake is to buy the property first and sort the visa later. Visa applications — particularly the O-A (which requires a Thai bank account with the deposit seasoned for two months before first application) and the LTR (BOI review takes several weeks) — need lead time. If you plan to spend significant time on Phangan immediately after buying, line up the visa application in parallel with the conveyancing process, not after. For the full buying timeline and what the contracts stage involves, see [How to buy property on Koh Phangan step by step](/knowledge/how-to-buy-property-step-by-step).",
    ],
    takeaways: [
      "A leasehold villa or land purchase on Koh Phangan gives you property rights only — no visa, no right of residency, no immigration benefit.",
      "The THB 3M property investment visa requires a freehold condo registration at the Land Department; leasehold villas do not qualify.",
      "Thailand Elite (5–20 years, no income requirement) is the simplest entry — pay a membership fee, no paperwork threshold to meet annually.",
      "Retirement Visa (O-A): age 50+, ฿800,000 Thai bank deposit or ฿65,000/month income, health insurance — most cost-effective for retirees who qualify.",
      "LTR Visa (10 years, BOI): requires $80,000/year income; includes a digital work permit and 17% flat income tax rate — strongest option for high earners.",
    ],
    sources: [
      {
        title: "BOI Thailand — LTR Visa programme (ltr.boi.go.th)",
        url: "https://ltr.boi.go.th/",
      },
      {
        title: "AIM Bangkok — 3M Property Investment Visa Thailand 2026: Confirmed Rules & Process",
        url: "https://aimbangkok.com/investment-residency-thailand-3-million-baht/",
      },
      {
        title: "Sukhothai Inter Law — Thailand Visa Property Purchase: Complete Guide for Foreign Buyers",
        url: "https://re.sukhothaiinterlaw.com/real-estate-visa-thailand/",
      },
      {
        title: "Terms.law — Thailand Long-Stay Visas 2026: DTV vs LTR vs Elite vs Retirement",
        url: "https://terms.law/Thai/visas/visa-comparison-matrix.html",
      },
      {
        title: "Siam Legal International — Retirement Visa Thailand 2026",
        url: "https://www.siam-legal.com/thailand-visa/Thailand-Retirement-Visa.php",
      },
      {
        title: "Thailand Elite Visa — official programme information",
        url: "https://www.thaiembassy.com/thailand-visa/thai-elite-visa",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Does buying property on Koh Phangan give me the right to live in Thailand?",
  },
  {
    slug: "buying-in-chaloklum",
    kbId: "kb-0029",
    topic: "Phangan",
    title: "Buying property in Chaloklum, Koh Phangan: the island's northern fishing village",
    short:
      "Chaloklum is Koh Phangan's northern fishing capital — a quiet bay village that has built a second identity as the island's diving hub. It suits buyers who value authenticity, water-sports access and a slower pace over resort amenities or short-stay yield, and who accept a longer drive to the island's main services.",
    updated: "2026-06-22",
    body: [
      "Chaloklum (Ban Chaloklum) occupies a broad semicircular bay on Koh Phangan's northern tip, 20–30 minutes by motorbike from the main port at Thong Sala. It is one of the least-changed corners of the island: a working fishing village with long-tail boat fleets and seafood restaurants that have co-existed with a growing diver community, resident artists and long-stay expats for the better part of two decades. That mix — authenticity and water sport, not nightlife and resort — defines who buys here and why.",
      { h: "Character and community" },
      "Chaloklum remains genuinely Thai in character. The village has 7-Elevens, ATMs, a Sunday evening market with grilled seafood and local produce, and a cluster of dive centres and boat-charter operators. The expat community — writers, artists, divers and long-stay residents — has grown steadily, but the area has not been transformed by the kind of mass tourism that reached Haad Rin or the wellness-industry boom that reshaped Sri Thanu. For a buyer who wants an existing neighbourhood rather than a new-build estate, Chaloklum offers that.",
      "The dive community is the most distinctive element. Chaloklum is the island's primary dive departure point — most of Koh Phangan's dive centres operate from here, offering courses and day trips to the Gulf of Thailand's most celebrated site, Sail Rock (Hin Bai), a granite pinnacle between Phangan and Koh Tao that regularly produces whale shark sightings. This gives the area a specific tenant profile: dive instructors, water-sports enthusiasts and adventure travellers who seek an active base rather than a wellness retreat.",
      { h: "Beaches" },
      {
        ul: [
          "**Malibu Beach** — the main beach on the western arm of the bay. Fine white sand, calm and shallow water, well-suited to families; note that at low tide the water retreats far, so plan swimming around the tidal cycle.",
          "**Haad Khom** — a quieter cove 1.5–2 km east of the village centre, with a fringing reef good for snorkelling. The beach is walkable and remains relatively undeveloped. Avoid standing on the coral.",
          "**Bottle Beach (Hat Khuat)** — one of the island's most scenic north-coast beaches, accessible only by longtail boat from Chaloklum pier (approximately 20 minutes). It is a day-trip destination, not a residential area, but easy access from Chaloklum is a practical advantage for buyers in the village.",
        ],
      },
      { h: "What is available to buy" },
      {
        ul: [
          "**Pool villas and houses** — the range runs from smaller renovation-ready properties starting around THB 6–8 million to contemporary sea-view villas in the THB 20–30 million range. A recently listed 3-bedroom villa with sea views was priced at THB 29 million (542 m²). Turnkey and furnished options are available.",
          "**Condominiums and apartments** — a smaller segment than on the western coast, but present. Entry-level 2-bedroom beachfront apartments have been listed from around THB 3.5 million. Developments including Gaia Residence (an eco-villa project on elevated land with panoramic views, scheduled Q3 2026) reflect growing developer interest.",
          "**Land plots** — available across a wide range (THB 2.1–62 million depending on size, title and sea-view premium). Chaloklum's topography is mixed: the flat bay-front land carries a beachfront premium, while hillside plots with views are more affordable per rai but may cross into Zone 3(1) restrictions above 80 m elevation under the 2025 environmental rules. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
        ],
      },
      { h: "Prices and market context" },
      "Chaloklum has historically been priced below the southwest coast wellness belt, reflecting its quieter character and longer service drive. That discount is narrowing as the area develops. Land with genuine sea views and Chanote title in the bay and on accessible hillside positions currently trades from roughly THB 3–8 million per rai, with premium plots higher. Developer interest — a 104-room beachfront hotel and six beachfront pool villas are in planning, alongside a proposed boardwalk project — signals confidence in the area's trajectory, though construction timelines in northern Koh Phangan are less predictable than in the more-developed west. See [How land is priced on Koh Phangan](/knowledge/how-land-is-priced-price-per-rai).",
      "All villa and land transactions for foreign buyers are structured as leasehold — a 30-year registered land lease plus building ownership via a registered superficies. Standard legal structure applies island-wide. See [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      { h: "The rental case" },
      "Chaloklum's tenant profile is distinct from the rest of the island: dive instructors on monthly arrangements, water-sports visitors staying two to four weeks, and long-stay expats taking a house for a season or longer. That profile suits monthly-let structures, which sit outside the Hotel Act's short-stay licensing requirement. Nightly-rate tourism is lower here than at beachfront locations on the western coast — owners aiming at short-stay holiday rentals will achieve lower gross rates than comparable product in Haad Yao or Sri Thanu, though occupancy among the dive-community segment is consistent.",
      "Monthly rental rates for a well-located house or villa in Chaloklum run approximately THB 20,000–60,000 depending on size and specification. High season (December–April) sees stronger demand; November can be challenging due to the northeast monsoon, which brings heavier rain and rougher seas to the north coast. Plan for reduced occupancy in the October–November trough. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
      { h: "What to verify when buying here" },
      "Standard island-wide due diligence applies — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan). Specific points for Chaloklum:",
      {
        ul: [
          "**Road access to eastern beaches**: roads to Haad Khom and the eastern side of the bay include narrow unpaved tracks that can be difficult in wet weather. Confirm year-round access to any plot that does not front the main road.",
          "**Title class**: the area has a mix of Chanote and lower-grade titles. Verify the document class and check it against the Land Office record. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Elevation and zoning**: Chaloklum's terrain rises steeply behind the bay. Hillside plots above 80 m elevation fall under Zone 3(1) restrictions (max 6 m building height, minimum 50% green space, slope-sensitive rules). Confirm the specific plot's elevation before committing to a build design. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
          "**Tidal range**: flat plots near Malibu Beach should be checked against tidal and storm-surge data — the bay is open to the north and exposed to northeast monsoon swells in October–December.",
          "**Utilities**: mains water and electricity reach the village core, but coverage on hillside and secondary roads is patchy. Verify meter registration and confirm the actual supply source for any property away from the main village. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
        ],
      },
      { h: "Who Chaloklum suits — and who it does not" },
      "Chaloklum is the right choice for a buyer who wants an authentic Thai-character neighbourhood, values dive and snorkelling access over resort facilities, and whose rental model suits monthly-stay tenants rather than nightly bookings. Families who want calm shallow water and a real village feel, and long-stay expats who appreciate a community that has built up organically, are well served here.",
      "It is not the right choice for buyers focused on maximising short-stay vacation-rental income — the western sea-view corridor (Haad Yao, Sri Thanu) commands significantly higher nightly rates from tourism-oriented guests. Nor is it suited to buyers who need frequent access to the island's full range of services without a daily drive: major medical, banking, and commercial amenities require the trip to Thong Sala. For buyers who want the calm north of the island without committing to the diving-community character, [Thong Nai Pan](/knowledge/buying-in-thong-sala) on the northeast coast offers a comparable pace with a different profile.",
    ],
    takeaways: [
      "Chaloklum is Koh Phangan's northern fishing village and the island's primary diving hub — a quiet, authentic community 20–30 minutes from Thong Sala.",
      "Property ranges from entry-level apartments around THB 3.5 million to sea-view villas at THB 20–30 million; land from roughly THB 3–8 million per rai with Chanote title.",
      "The natural tenant base is divers, water-sports visitors and long-stay expats — monthly-let structures, not nightly short-stay, suit this market best.",
      "Hillside plots above 80 m are subject to Zone 3(1) building restrictions under the 2025 environmental rules; road access to eastern beaches requires individual verification.",
      "Developer interest is growing (hotel, pool villas, boardwalk projects in planning), but Chaloklum remains below the west coast on price and short-stay rental yield.",
    ],
    sources: [
      {
        title: "Islanders Properties — Chaloklum, Koh Phangan: Malibu & Haad Khom beaches, Sail Rock diving, access and daily life",
        url: "https://islanders-properties.com/blog/chaloklum-koh-phangan-malibu-haad-khom-beaches-sail-rock-diving-access-and-daily-life-193",
      },
      {
        title: "Koh Phangan Property — Chaloklum area listings",
        url: "https://islanders-properties.com/thailand/koh-phangan/chaloklum/",
      },
      {
        title: "Samui Island Realty — Chaloklum Property",
        url: "https://samui-island-realty.com/area/chaloklum/",
      },
      {
        title: "Keller Henson — Zasa Malibu Villa (Chaloklum project overview)",
        url: "https://kellerhenson.com/project/chaloklum-village",
      },
      {
        title: "Sukhothai Inter Law — New Zoning Law for Koh Samui, Koh Phangan & Koh Tao (May 2025)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "What is Chaloklum like for buying property on Koh Phangan, and who does it suit?",
  },
  {
    slug: "buying-in-haad-yao-haad-salad",
    kbId: "kb-0030",
    topic: "Phangan",
    title: "Buying property in Haad Yao and Haad Salad, Koh Phangan: sunset views and the sea-view premium",
    short:
      "Haad Yao and Haad Salad form the northwest coast's premier sea-view corridor — two bays separated by a headland, both facing west for full-front sunsets and views across Ang Thong Marine Park. They attract mid-to-high net worth buyers seeking elevated hillside villas with snorkelling access and strong vacation-rental potential, at the island's top price tier.",
    updated: "2026-06-22",
    body: [
      "Haad Yao and Haad Salad sit on Koh Phangan's northwest coast, 15–20 minutes from Thong Sala by scooter or taxi. They form a single investment corridor — two west-facing bays divided by a low headland — though each has a distinct character. Haad Yao is a long, open arc of white sand with a coral reef 300–400 metres offshore and a beachfront strip of cafés and small resorts. Haad Salad, a few kilometres north, is smaller, quieter and more secluded, with a tighter bay and elevated hillside development accessed through gated villa communities. Both share the same defining asset: a west-facing position that delivers consistent sunset views across the 42 islands of Ang Thong Marine Park.",
      { h: "The character of the two bays" },
      "Haad Yao is the more developed of the two, with a functioning beachfront — cafés, bars, a dive shop, kayak and SUP rental — and a mix of backpacker bungalows and boutique hillside hotels. The beach itself is fine white sand with easy entry and a coral reef within snorkelling range. The buyer-facing product here is almost entirely hillside: most villas for sale sit on the western ridge above the beach, with elevated sea views and a short walk or scooter ride to the shore. Direct beachfront product is rare and priced at a significant premium.",
      "Haad Salad is quieter and more exclusively residential. The bay is narrower, the beachfront is less developed, and the hillside above it concentrates most of the island's gated villa communities — secluded developments with private pools, managed common areas and security. The character is closer to a private resort than a village. Buyers who want total privacy and a manicured environment typically prefer Haad Salad; buyers who want more community life and beach-bar access choose Haad Yao.",
      "Both areas share a growing wellness and yoga layer — studios and health-food venues in the broader northwest corridor that began in Sri Thanu have extended northward — and attract a similar demographic: affluent digital nomads, mid-to-high net worth families and investors targeting vacation-rental income.",
      { h: "What is available to buy" },
      {
        ul: [
          "**Hillside sea-view pool villas** — the dominant product. Most range from 2 to 4 bedrooms; a typical 3-bedroom sea-view villa in Haad Yao currently sells for THB 20–30 million. At the upper end, larger or custom-built properties exceed THB 30 million, with a small number of exceptional hillside estates significantly higher. Haad Salad has seen luxury 4-bedroom villas listed at around THB 23.9 million. Off-plan projects are active in both bays: recent completions and imminent launches include Dolcevita 2 (8 units), Samma Villas (5 units, from USD 203K) and Asteria Villas, among others.",
          "**Land plots (sea-view and beachfront)** — good sea-view land on the northwest coast currently trades from approximately THB 9–15 million per rai; beachfront land commands a minimum of THB 20 million per rai. A Chanote-titled sea-view plot of 1,420 m² in Haad Yao was recently listed at THB 6.2 million (now sold), reflecting the range at the lower end of the sea-view tier. Rare dual-view plots with sight lines to both Haad Yao and Haad Salad carry additional premium.",
          "**Condominium units** — Haad Yao forms part of the Sri Thanu/Haad Yao corridor that concentrates the island's highest density of condominium projects. Foreign buyers can acquire freehold units within the 49% foreign-quota limit. This is one of the island's best locations to find a freehold entry point if a full villa leasehold is not the right structure.",
        ],
      },
      { h: "Prices and investment case" },
      "The northwest coast has seen the island's strongest price appreciation over the past four years, driven by concentrated international buyer demand for sea-view product. House prices across Koh Phangan appreciated 8.9% year-on-year from mid-2024 to mid-2025, with the western and northwestern hillside positions leading that trend. Prime institutional and private buying activity has clustered here specifically, attracted by panoramic views, privacy and the vacation-rental yield profile.",
      "For the rental case, hillside sea-view villas in Haad Yao attract well-paying short-stay guests — holiday travellers who book on Airbnb or villa platforms specifically for the sunset view. Occupancy rates at well-managed premium properties can exceed 70–80%. At these occupancy levels, a villa purchased for THB 25–30 million can generate gross nightly income that supports net yields in the 8–12% range — though achieving the top of this range requires professional management, competitive pricing and consistent platform presence. Nightly rates at luxury 4-bedroom villas in this area run from THB 15,000–40,000+ depending on season and specification. The Hotel Act licensing requirement applies: properties accepting short stays under 30 days need a hotel licence. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
      "All villa and land transactions for foreign buyers are leasehold — 30-year registered land lease plus building ownership via registered superficies. For context on the legal structure, see [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa) and [Leasehold vs freehold](/knowledge/leasehold-vs-freehold).",
      { h: "Elevation and the 2025 building rules" },
      "The hillside character of both bays is the source of the premium — and the source of the main planning constraint. The 2025 environmental protection rules for Surat Thani Province establish Zone 3(1) restrictions above 80 m elevation: maximum building height 6 m, minimum 50% green space, slope-sensitive roof requirements, and prohibition on subdivision or resort-style development in hillside areas. Many of the sea-view plots in Haad Yao and Haad Salad sit above this 80 m threshold. Before committing to any plot, confirm the specific elevation and verify which zone applies to that parcel. Plots that cross the 80 m line may have their buildable footprint and height significantly reduced compared to lower-altitude alternatives.",
      "Plots within a development that already holds a building permit were generally grandfathered under the prior rules — verify the permit status of any off-plan project carefully. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones) and [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan).",
      { h: "What to verify when buying here" },
      "Standard due diligence applies throughout the island — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan). Points specific to this corridor:",
      {
        ul: [
          "**Elevation and zone**: confirm the exact elevation of the plot against the Zone 3(1) threshold (80 m). Many hillside sea-view plots exceed this; verify before signing.",
          "**Title class**: Chanote titles are available in both bays but the mix includes Nor Sor 3 Gor. A sea-view plot's price should be benchmarked against its title class and condition. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Road access and gradient**: hillside access roads vary from paved gated-community drives to steep tracks. Confirm year-round driveable access and whether the right of way is registered.",
          "**Hotel licence for short-stay rentals**: villas accepting guests for stays under 30 days require a hotel licence (Establishment Act). If the investment case depends on nightly bookings, confirm the licence is in place or obtainable before purchase.",
          "**Utilities**: underground electricity is available in some developments; confirm supply reliability on the specific plot. Water supply on elevated hillside plots may be via private tank, well or tanker delivery — not mains. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
          "**View protection**: confirm that adjacent plots do not carry existing permits that would block the sea view the price is premised on.",
        ],
      },
      { h: "Who this corridor suits — and who it does not" },
      "Haad Yao and Haad Salad are the right choice for buyers who place a high value on sunset sea views, premium hillside living and strong vacation-rental income from a short-stay guest profile. The corridor commands the island's highest price-per-sqm for finished villas — buyers get what they pay for, but the premium is real. The investment case works best for active rental management: a villa left unmanaged on this hillside generates less than its potential; professionally managed and marketed, it is among the island's strongest yield positions.",
      "The corridor is not right for buyers focused on community integration (Sri Thanu, to the south, is better for that), urban convenience (Thong Sala), or entry-level price points. The 2025 hillside-zone restrictions mean that raw land above 80 m is subject to build constraints that require careful verification before assuming the development outcome the price implies. For a buyer who wants a comparable lifestyle at a lower price with less hillside complexity, [Sri Thanu](/knowledge/buying-in-sri-thanu) immediately to the south is the most direct alternative.",
    ],
    takeaways: [
      "Haad Yao and Haad Salad are Koh Phangan's premier sunset sea-view corridor — west-facing bays 15–20 minutes from Thong Sala, with views across Ang Thong Marine Park.",
      "Typical 3-bedroom hillside sea-view villa prices run THB 20–30 million; sea-view land from roughly THB 9–15 million per rai; beachfront land from THB 20 million per rai.",
      "Premium vacation-rental yields are achievable — well-managed properties report 70–80%+ occupancy and potential net yields of 8–12% — but short-stay lets require a hotel licence.",
      "Many sea-view plots sit above 80 m elevation and are subject to Zone 3(1) building restrictions under the 2025 environmental rules; verify before committing to any hillside purchase.",
      "Haad Salad is more secluded and gated; Haad Yao has more community life. Both suit mid-to-high net worth buyers; for community living at lower prices, Sri Thanu immediately south is the closest alternative.",
    ],
    sources: [
      {
        title: "Islanders Properties — Haad Yao, Koh Phangan: comprehensive area guide",
        url: "https://islanders-properties.com/blog/haad-yao-koh-phangan-comprehensive-area-guide-beach-reef-sunsets-182",
      },
      {
        title: "Conrad Properties — Sea view land for sale in Haad Yao",
        url: "https://www.conradproperties.asia/properties/koh-phangan-sea-view-land-for-sale-haad-yao",
      },
      {
        title: "Koh Phangan Homes — Haad Yao area listings",
        url: "https://phanganlandandhome.com/area/haad-yao/",
      },
      {
        title: "Koh Phangan Estate — Annual housing appreciation on Koh Phangan: key drivers, market trends & investment insights",
        url: "https://kohphangan.estate/blog/tpost/de0ng2hti1-annual-housing-appreciation-on-koh-phang",
      },
      {
        title: "Samui Phangan Real Estate — Koh Phangan property investment",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-property-investment/",
      },
      {
        title: "Sukhothai Inter Law — New Zoning Law for Koh Samui, Koh Phangan & Koh Tao (May 2025)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "What are Haad Yao and Haad Salad like for buying property on Koh Phangan, and is the sea-view premium worth it?",
  },
  {
    slug: "buying-in-ban-tai-ban-khai",
    kbId: "kb-0031",
    topic: "Phangan",
    title: "Buying property in Ban Tai and Ban Khai, Koh Phangan: the south coast's value tier",
    short:
      "Ban Tai and Ban Khai form Koh Phangan's south coast — a 4 km arc directly south of the ferry port at Thong Sala. The area offers a rare combination of beach access and urban convenience at the island's most accessible price point, with sunset views across the southern bay toward Koh Samui.",
    updated: "2026-06-26",
    body: [
      "Ban Tai and Ban Khai run along Koh Phangan's south coast, curving southeast from Thong Sala toward Haad Rin. Of all the island's residential areas, this one sits closest to the service backbone — major banks, the hospital, Makro and government offices are 5–15 minutes away in Thong Sala — while still having a beach. That combination of convenience and coast, at price points below the premium western corridor, defines who buys here and what they rent to.",
      { h: "Character of the area" },
      "Ban Tai and Ban Khai have the most workaday character on the island's populated south side. The beachfront road carries a mix of guesthouses, seafood restaurants, convenience stores and local businesses that have built up over decades of serving both Thai residents and overflow from the Haad Rin party circuit. There is no dominant identity — not wellness (Sri Thanu), not logistics (Thong Sala), not diving (Chaloklum) — but a functional, mixed-use south coast town with a long sandy beach running its length.",
      "The beaches face south and slightly west. At high tide the water covers a long stretch of fine sand; at low tide it retreats significantly over shallow ground. Ban Khai, toward the eastern end of the arc, has a coral reef roughly 200 metres offshore that provides the best snorkelling in the stretch. Sunset views across the southern bay — with the silhouette of Koh Samui and the Ang Thong islands visible in clear conditions — are the area's main landscape asset.",
      { h: "What is available to buy" },
      {
        ul: [
          "**Pool villas (1–3 bedrooms)** — the primary product for foreign buyers. A mix of smaller older units, renovation properties and new-build developments. Active projects have included 3-bedroom units in the THB 11–12 million range off-plan. The price ceiling for new villas in this area sits generally below the premium west coast corridor.",
          "**Houses** — a range of older Thai houses, renovated properties and smaller villa compounds. Entry prices are the most accessible on the island for a liveable freestanding property. Standalone houses in the THB 3–8 million range appear with more frequency here than on the western or northern coasts.",
          "**Land plots** — beach-proximity plots along the main south coast road and inland on secondary roads. The south coast sits at generally low elevation, keeping most plots outside the Zone 3(1) hillside restrictions that apply above 80 m under the 2025 environmental rules — a practical advantage over elevated western-coast land. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones).",
          "**Condominiums** — a smaller condo market than in the Sri Thanu/Haad Yao corridor. Freehold units within the 49% foreign-ownership quota exist but are limited; verify quota availability at any specific project.",
        ],
      },
      { h: "Prices and market context" },
      "Ban Tai and Ban Khai represent the island's value tier for coastal property. Land along the south coast runs roughly **THB 3–5 million per rai**, with beachfront or closer-to-shore plots at the upper end. That is below the northwest coast wellness belt and well below the sea-view hillside tier (Haad Yao: THB 9–15M per rai), reflecting the trade-off: accessible coast without elevated panoramas or a wellness-community premium.",
      "Completed pool villas typically range from roughly **THB 6–15 million** for one to three bedrooms on a leasehold basis. Entry-level smaller houses and renovation properties are available below that. Off-plan entry prices run approximately 15–20% below the estimated completed value — with developer and completion risk attached. See [Buying off-plan on Koh Phangan](/knowledge/buying-off-plan-new-developments).",
      "All villa and land purchases for foreign buyers are structured as leasehold — a 30-year registered land lease combined with ownership of the building through a registered superficies. See [Leasehold vs freehold](/knowledge/leasehold-vs-freehold) and [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      { h: "The rental case" },
      "Ban Tai and Ban Khai generate year-round rental demand from a broader demographic than most Phangan locations: holiday guests wanting beach proximity at mid-market rates, long-stay expats who value the service infrastructure, visitors attending the monthly Full Moon Party who prefer the south coast's easier access over staying in Haad Rin itself, and island workers who need proximity to Thong Sala.",
      "Monthly rents for a well-located villa run roughly **THB 20,000–55,000** depending on size, specification and season. For short-stay vacation rentals, nightly rates are moderate compared to the premium northwest corridor but occupancy is more broadly spread across the calendar year given the diverse tenant base. The Hotel Act licensing requirement applies: rentals of under 30 days require a hotel licence. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
      "The tidal beach — shallow at low water with variable water quality — limits the premium that a 'beachfront' label commands here compared to locations with clearer water and reliable year-round swimming. Factor this accurately into a vacation-rental pricing model.",
      { h: "What to verify when buying here" },
      "Standard island-wide due diligence applies — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan). Points specific to this area:",
      {
        ul: [
          "**Title class**: the south coast has a mix of Chanote and Nor Sor 3 Gor titles. Both are workable with proper verification. Confirm the class and the deed against the Land Office record before committing. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Tidal range and flood exposure**: low-lying plots close to the beach are subject to seasonal flooding in the wet season (May–October). Visit the property at different tidal states and ask neighbours about flooding and drainage history before committing.",
          "**Road access**: the main beachfront road is well maintained, but secondary roads inland include unpaved tracks. Confirm a registered right of way to the public road — verbal access is one of the most common island traps. See [Due diligence before buying](/knowledge/due-diligence-checklist-koh-phangan).",
          "**Proximity to Haad Rin**: the further east into Ban Khai toward Haad Rin, the stronger the Full Moon Party effect — monthly large-crowd events, noise and congestion on those nights. Factor this in if you plan to live in the property or target long-stay tenants who prioritise quiet.",
          "**Utilities**: mains water and electricity are available along the main road; on secondary roads and newer developments, verify meter registration and supply reliability rather than assuming it. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
          "**Existing building permits**: for any existing structure, confirm the construction permit (Por. Ror. 1) exists and matches what is built. Older south-coast stock may have unpermitted extensions that become the buyer's problem at transfer. See [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan).",
        ],
      },
      { h: "Who Ban Tai and Ban Khai suit — and who they do not" },
      "Ban Tai and Ban Khai are for the buyer who wants beach proximity, easy access to the island's services and a genuinely affordable entry point — without the premium that comes with a sea-view hillside position or an established wellness community. It works well for: an investor seeking a versatile rental that draws from multiple tenant segments year-round; a buyer who prioritises being close to Thong Sala's ferry and services; and anyone whose daily-life priorities include town access as much as beach access.",
      "It is not the right choice for buyers whose primary goal is spectacular elevated sea views — for that, Haad Yao or the northwest corridor is the answer. Nor does it suit buyers who want a secluded retreat setting; Ban Tai is a working south coast town. For community-focused wellness living at a similar price point, [Sri Thanu](/knowledge/buying-in-sri-thanu) is the closer alternative. For purely logistical access without a beach, [Thong Sala](/knowledge/buying-in-thong-sala) is the more efficient choice.",
    ],
    takeaways: [
      "Ban Tai and Ban Khai form the island's south coast — 5–15 minutes from Thong Sala's ferry port, beach access, and the most accessible price tier on Koh Phangan.",
      "Land typically runs THB 3–5 million per rai; completed pool villas from roughly THB 6–15 million on a leasehold basis.",
      "Low elevation keeps most south coast plots outside the 2025 hillside-zone restrictions — more permissive build rules than elevated west coast land.",
      "Year-round rental demand from a diverse tenant base (holiday guests, long-stay expats, island workers) provides more seasonal stability than purely tourism-driven locations.",
      "The tidal beach — shallow at low water with variable water quality — caps the short-stay premium; factor this accurately into a vacation-rental pricing model.",
    ],
    sources: [
      {
        title: "Islanders Properties — Best Areas to Live on Koh Phangan: Local Expat Guide",
        url: "https://islanders-properties.com/blog/koh-phangan-areas-84",
      },
      {
        title: "FazWaz — Land for sale in Ban Tai, Koh Phangan",
        url: "https://www.fazwaz.com/land-for-sale/thailand/surat-thani/koh-phangan/ban-tai",
      },
      {
        title: "Koh Phangan Land and Home — Ban Tai area listings",
        url: "https://phanganlandandhome.com/area/ban-tai/",
      },
      {
        title: "Samui Phangan Real Estate — Koh Phangan real estate market overview",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-real-estate-market/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Ban Tai and Ban Khai like for buying property on Koh Phangan, and who should buy there?",
  },
  {
    slug: "buying-in-thong-nai-pan",
    kbId: "kb-0032",
    topic: "Phangan",
    title: "Buying property in Thong Nai Pan, Koh Phangan: premium twin bays on the remote northeast coast",
    short:
      "Thong Nai Pan Noi and Yai — two sheltered white-sand bays on Koh Phangan's northeast coast — are the island's most celebrated beach destination. Remote, quiet and substantially within national park territory, the area attracts buyers who prioritise natural beauty and seclusion over rental yield or urban convenience. Environmental restrictions and infrastructure limitations are the principal constraints.",
    updated: "2026-06-26",
    body: [
      "Thong Nai Pan consists of two bays — Thong Nai Pan Noi (the smaller northern bay) and Thong Nai Pan Yai (the larger southern bay) — on Koh Phangan's northeast coast, roughly 20 km from the main ferry port at Thong Sala via a winding mountain road. Together they form the island's most celebrated stretch of beach: sheltered, clear-water, white sand, with the steep jungle of the Than Sadet-Ko Phangan National Park rising directly behind them. That beauty and isolation define the buyer profile here — as well as the constraints.",
      { h: "Character and setting" },
      "Thong Nai Pan is the quietest of the island's main bay areas. There is no Full Moon Party draw, no wellness-industry cluster, no commercial hub nearby. What the area has is genuinely exceptional beaches, a pace of life that even Koh Phangan's more remote corners rarely match, and a small but established community of high-net-worth foreign owners and resort-class accommodation. Thong Nai Pan Noi is the smaller and calmer of the two bays, considered among the most beautiful on the island. Thong Nai Pan Yai is larger, with a longer beach and the area's main concentration of accommodation and services.",
      "The access road is the defining characteristic of daily life here. A single paved mountain road — 20 km from Thong Sala, roughly 30–40 minutes' drive — traverses steep jungle terrain with sustained gradients and tight bends. A scooter of at least 150cc is recommended on the steepest sections. An alternative is by boat: speedboat services from Koh Samui can reach the bay in approximately 45 minutes, and longtail boat connections are available. In the northeast monsoon season (October–November), the bay is directly exposed to stronger swell from the north.",
      { h: "What is available to buy" },
      {
        ul: [
          "**Luxury hillside and beachfront villas** — the dominant category. Most new-build product in the area is positioned at the upper end of the island market: 3–8 bedroom properties with pool and sea views, in the THB 20–55 million range and above for larger or resort-scale developments. Supply is structurally constrained by the national park buffer, zoning rules and the narrow access road.",
          "**Land plots (hillside and sea-view)** — scarce. Land with genuine sea views or proximity to the bays trades at a significant premium to the island average. Available data points to approximately **THB 13 million per rai** for sea-view hillside land in this area — above the Haad Yao and Haad Salad corridor (THB 9–15M per rai) and reflecting a scarcity and prestige premium. Beachfront land is extremely rare when it comes to market.",
          "**Small-scale resort properties** — a handful of existing small resort operations have changed hands in this area. These are specialist acquisitions requiring hotel licensing, thorough environmental compliance review and a specific operational strategy.",
        ],
      },
      { h: "Prices and the scarcity premium" },
      "Thong Nai Pan commands a premium explicitly tied to scarcity rather than service infrastructure. Land and villa prices are at or above the northwest coast's sea-view tier — despite the longer drive time and less reliable utilities — because the beach quality is genuinely exceptional and new supply is structurally constrained by the environmental rules and national park boundary.",
      "Land at roughly THB 13 million per rai sits at the upper end of the island range. A 3-bedroom villa with sea views in this area is estimated in the THB 20–30 million range, with larger or resort-class properties well above that. The valuation premium is real — but the buyer accepting it should be clear about what they are purchasing: natural beauty and seclusion, not yield or convenience. See [How land is priced on Koh Phangan](/knowledge/how-land-is-priced-price-per-rai).",
      "All villa and land transactions for foreign buyers are structured as leasehold — 30-year registered land lease plus building ownership via registered superficies. See [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
      { h: "The 2025 environmental rules and national park proximity" },
      "Thong Nai Pan's terrain rises steeply above both bays. Most hillside land sits above 80 m elevation, placing it inside the Zone 3(1) restrictions under the 2025 environmental protection regulation: maximum building height 6 m, minimum 50% green space, natural-coloured roofing, and no land subdivision or resort-style development on hillside parcels. Above 140 m, Zone 3(2) restrictions apply a stricter 90 m² maximum footprint and 70% open space requirement. Beachfront and near-shore land faces setback and wastewater treatment requirements.",
      "The area borders the Than Sadet-Ko Phangan National Park, which covers approximately 40% of the island. Properties encroaching on park territory have faced enforcement action in 2025–2026 as authorities intensified inspections in protected areas. Any plot in or near Thong Nai Pan requires a confirmed clean land title (not forest reserve or national park encroachment), a verified zone classification, and — for any building project — a permit confirmed with the local OrBorTor authority. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones) and [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan).",
      { h: "Infrastructure and utilities" },
      "Infrastructure here is meaningfully less reliable than in the island's main developed areas. Water supply on hillside and remote plots relies on private wells, rainwater collection or tanker delivery — mains coverage does not extend consistently to properties away from the main bay development. Electricity is supplied via PEA connection but grid reliability at this distance from the main distribution network means outages occur; new builds and many existing villas install solar with battery storage or generator backup. Internet connectivity is the most significant practical constraint for any buyer intending to use the property as a primary base for remote work: AIS 4G coverage exists in the bay area but signal reliability on hillside and secondary plots is patchy, and satellite internet (Starlink) is increasingly used as the primary connection at significantly higher monthly cost. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
      { h: "The rental case — honestly assessed" },
      "Thong Nai Pan attracts premium-positioned short-stay vacation renters seeking the beach experience specifically. Nightly rates at well-specified 3–4 bedroom villas can range from THB 8,000–20,000+, comparable in scale to the northwest coast premium tier. The Hotel Act licensing requirement applies to all stays under 30 days — a hotel licence is required for nightly rentals.",
      "The occupancy caveat is real. The northeast monsoon season (October–November) brings heavier rain and rougher sea conditions to this coast, shortening the effective high season compared to the west. The mountain access road means guests without their own transport need to plan transfers carefully, limiting the spontaneous tourist flow that more accessible locations benefit from. Honest yield modelling should assume lower occupancy than comparable-spec properties in Haad Yao or Sri Thanu. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
      { h: "What to verify when buying here" },
      "Standard island-wide due diligence applies — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan). Critical points specific to Thong Nai Pan:",
      {
        ul: [
          "**Title and national park boundary**: confirm the title is Chanote or Nor Sor 3 Gor and that the plot does not encroach on national park or forest reserve land. Enforcement of illegal encroachment in this area was active in 2025–2026. See [Land titles on Koh Phangan](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Zone and elevation**: confirm the specific elevation and zone classification of the plot. Most hillside land is above 80 m (Zone 3(1)) or 140 m (Zone 3(2)). Both impose material building restrictions — verify the planned development is permissible before purchase.",
          "**Building permits on existing structures**: for any property with an existing villa, confirm the construction permit (Por. Ror. 1) was lawfully obtained and the building matches the approved plans. Unpermitted structures in environmental protection zones face demolition risk.",
          "**Road access**: confirm legal access to the property via the public road exists as a registered servitude on the title deed, not just a visible track. Secondary tracks and driveway connections to the plot require their own registered access rights.",
          "**Utilities as specific infrastructure**: test 4G signal at the actual plot. Request documented evidence of the water supply method (well yield test, mains meter reference or tank arrangement) and PEA electricity meter registration — do not rely on seller assurances. See [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan).",
          "**Monsoon exposure**: the northeast coast is directly exposed to the northeast monsoon swell (October–November). Assess flood risk and water-ingress protection for any beachfront or low-lying plot. Walking the plot in the wet season before committing is strongly recommended.",
        ],
      },
      { h: "Who Thong Nai Pan suits — and who it does not" },
      "Thong Nai Pan is the right choice for a buyer who places the highest value on natural beauty, seclusion and an exceptional beach setting, and who is buying primarily for lifestyle rather than to maximise rental yield. The buyer who wants the island's most celebrated beaches, a truly quiet environment, and is comfortable with a 30–40 minute mountain drive to services and with less reliable utilities will find a compelling case here.",
      "It is not the right choice for a buyer whose primary goal is rental yield maximisation — the west coast, [Haad Yao and Haad Salad](/knowledge/buying-in-haad-yao-haad-salad), delivers stronger vacation-rental yield with more reliable occupancy. Nor for a buyer who needs dependable internet for daily remote work, or who values service proximity. The premium over comparable western-coast product is paid for natural exclusivity, not investment returns.",
    ],
    takeaways: [
      "Thong Nai Pan Noi and Yai are Koh Phangan's most celebrated beaches — sheltered twin bays on the remote northeast coast, 20 km from Thong Sala via a steep mountain road.",
      "Land trades at a scarcity premium — approximately THB 13 million per rai for sea-view hillside land; most villas are positioned at or above the THB 20–30 million range.",
      "Almost all hillside land is above 80 m elevation and subject to Zone 3(1) or Zone 3(2) restrictions; national park proximity adds further compliance risk requiring careful title and permit verification.",
      "Utilities are less reliable than anywhere else on the island — confirm water supply, electricity and internet at the specific plot; satellite connectivity and solar/generator backup are standard for meaningful year-round use.",
      "The area suits lifestyle-driven buyers prioritising exclusivity and beach quality; yield-focused investors should assess the northwest coast first — mountain access and monsoon exposure reduce occupancy relative to the west-facing bays.",
    ],
    sources: [
      {
        title: "Koh Phangan Land and Home — Thong Nai Pan Noi and Yai area listings",
        url: "https://phanganlandandhome.com/area/tong-nai-pan-noi/",
      },
      {
        title: "Conrad Properties — Thong Nai Pan property listings",
        url: "https://www.conradproperties.asia/search/thailand/koh-phangan/north-east/thong-nai-pan",
      },
      {
        title: "Khao Sod English — Koh Phangan faces illegal development crisis in protected areas (October 2025)",
        url: "https://www.khaosodenglish.com/news/2025/10/18/koh-phangan-faces-illegal-development-crisis-in-protected-areas/",
      },
      {
        title: "Sukhothai Inter Law — New Zoning Law for Koh Samui, Koh Phangan & Koh Tao (May 2025)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-delegates-need-to-know-may-2025-update/",
      },
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Thong Nai Pan like for buying property on Koh Phangan, and who should buy there?",
  },
  {
    slug: "phangan-vs-samui-vs-tao-investment",
    kbId: "kb-0033",
    topic: "Market",
    title: "Koh Phangan vs Koh Samui vs Koh Tao for property investment: an honest comparison",
    short:
      "Three islands, three distinct markets. Samui is mature, liquid and expensive. Phangan is the growth story with real data behind it but smaller and less liquid. Tao is a dive-community island with a tiny property market and strong environmental constraints — not a conventional investment destination. The right choice depends on your goals, not the island's reputation.",
    updated: "2026-06-27",
    body: [
      "The three islands are often named together as a group — they share a ferry cluster, a provincial authority and the same 2025 environmental zoning regulation. As property markets, however, they are structurally different: different maturity levels, price tiers, rental profiles, liquidity and development constraints. A clean comparison starts with the legal baseline that applies to all three, then works through each island's actual numbers.",
      { h: "The legal baseline: identical across all three islands" },
      "The foreign-ownership rules are the same on Samui, Phangan and Tao. A foreigner cannot own land in their own name; the clean structure is a registered 30-year land lease combined with separate ownership of the building through a registered superficies. Freehold condominium ownership is possible within the 49% foreign-ownership quota. The May 2025 environmental protection regulation applies identically to all three islands — seven construction zones constraining what can be built on beachfront, hillside and high-elevation land. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones) and [Leasehold vs freehold](/knowledge/leasehold-vs-freehold).",
      "The nominee enforcement campaign of 2025–2026 applies island-wide, extending from Phangan and Samui to Phuket and Krabi. A Thai company used as a nominee vehicle for land ownership carries criminal exposure across all of Thailand, not just on these three islands. See [A Thai company for property (49/51)](/knowledge/thai-company-for-property-49-51).",
      { h: "Koh Samui: the mature market" },
      "Koh Samui is the established anchor of the three-island group. At Q1 2026, the island has 117+ active residential development projects with approximately 2,882 units on the market. Annual visitor numbers are projected to approach 6 million — a substantial and diverse tourism base. The island's main towns have hospitals, international schools, major banks and commercial amenities that Phangan and Tao do not match.",
      {
        ul: [
          "**Entry prices**: villa and house prices average around ฿22.1 million, with condominiums averaging ฿6.3 million. Premium hillside sea-view product in Chaweng Noi, Bophut and Choeng Mon (the 'Gold Triangle') is substantially higher.",
          "**Land prices**: well-located inland land in prime Samui areas runs ฿40,000–60,000 per square wah (roughly ฿16–24 million per rai); beachfront in Chaweng commands ฿150,000+ per square wah.",
          "**Rental yields**: net yields for well-managed villas run 5–8%; gross yields 7–10%. Samui's mature tourism infrastructure generates deeper occupancy data than Phangan.",
          "**Capital appreciation**: historical rate 8–12% annually; 2026 forward projection 7–9% in premium locations, 4–7% overall. Market observers describe Samui as 'selective' — not all locations perform equally.",
          "**Liquidity**: deeper than Phangan, with a broader buyer pool (significant Chinese and Russian buyer segments alongside European) and a more established secondary market for resales.",
        ],
      },
      "The Samui premium is real. Entry prices are the highest of the three islands, and Samui has already captured much of its equivalent of the Phuket growth cycle. Buyers choosing Samui are buying relative certainty and infrastructure — not the highest remaining growth-upside.",
      { h: "Koh Phangan: the growth market" },
      "Koh Phangan is at an earlier stage of the same cycle. At Q1 2026 the island has 41 active residential projects comprising 438 units with a combined development value of ฿7.94 billion — a much smaller inventory base than Samui. That supply constraint, combined with accelerating foreign demand, is what underpins the appreciation argument.",
      {
        ul: [
          "**Entry prices**: condominiums average around ฿7.9 million; villas roughly ฿12 million; land averages ฿20.27 million island-wide, with significant variation by location.",
          "**Land prices**: the western coast has seen 2–4× appreciation since 2022. Current levels: ฿3–5 million per rai (wellness-belt community areas); ฿9–15 million per rai (northwest sea-view hillside); ฿20+ million per rai (beachfront). Inland and secondary-road plots are substantially below these figures.",
          "**Rental yields**: well-managed premium properties can generate gross yields in the 8–12% range; net yields after management fees (~25%), maintenance and tax are lower — model conservatively and verify against real occupancy data before buying. Stays under 30 days require a hotel licence under the Hotel Act.",
          "**Capital appreciation**: house prices rose 8.9% year-on-year from July 2024 to July 2025, consistent with the 5–10% annual growth trajectory since 2016. Colliers has drawn a comparison to Phuket's market five years ago — still in the growth phase, with land prices meaningfully below Phuket and Samui equivalents.",
          "**Liquidity**: shallower than Samui. A well-structured leasehold villa can sell in 3–9 months; the buyer pool is smaller and almost entirely cash-only. See [Selling your leasehold villa](/knowledge/selling-leasehold-villa-exit-liquidity).",
        ],
      },
      "Phangan is the higher-upside, higher-risk choice relative to Samui. The growth numbers are real, but so is the smaller market, the thinner exit liquidity, and the requirement to get structure, title and zoning exactly right — mistakes that Samui's market depth would absorb are more exposed here.",
      { h: "Koh Tao: a different category entirely" },
      "Koh Tao requires a different framing. The island (21 km²) draws 300,000–500,000 tourists per year — almost exclusively as a dive destination. The economy is built on dive schools, backpacker accommodation and marine tourism. The property market is a fraction of Phangan's: a few hundred listings at any given time, almost no formal condominium development, and infrastructure substantially behind both neighbouring islands.",
      {
        ul: [
          "**Entry prices**: average house prices around ฿12.68 million — the most accessible of the three islands by headline price. The lower figure reflects smaller structures and fewer amenities, not an undiscovered value.",
          "**Market size**: no active large-scale residential projects comparable to Phangan or Samui. New development is constrained by the island's limited flat land, environmental sensitivities (coral reef protection, water scarcity) and the logistical difficulty of construction — all materials arrive by barge.",
          "**Rental profile**: the tenant base is almost entirely dive students, backpackers and short-stay visitors. Stable monthly demand is limited by the seasonality of dive tourism.",
          "**Liquidity**: the secondary market is illiquid. Foreign buyers who purchase here are typically people who have lived on the island and know it well — not external investors.",
          "**Environmental constraints**: Koh Tao is subject to the same 2025 seven-zone regulation as Phangan and Samui, with heightened local enforcement near coral reefs and protected marine areas.",
        ],
      },
      "Koh Tao is not a conventional property investment market. For a buyer who has dived here, loves the community and wants a personal base — possibly rented to the dive community on monthly terms — it can make sense as a lifestyle purchase. As a yield or appreciation play for an external investor, the thin liquidity, small scale, limited infrastructure and environmental constraints make it the highest-risk and least liquid of the three.",
      { h: "Which island for which goal" },
      {
        ul: [
          "**Established infrastructure, deepest liquidity, most certain exit**: Koh Samui — at a higher entry price and with less remaining growth upside relative to Phangan.",
          "**Growth upside, earlier in the appreciation cycle, higher potential yields**: Koh Phangan — at lower entry prices than Samui, but with shallower liquidity, a smaller market and less margin for error.",
          "**Lifestyle purchase in a dive community**: Koh Tao — a personal decision, not a yield or capital-appreciation calculation.",
        ],
      },
      "Across all three, the fundamentals hold: legal structure first (leasehold + superficies), then title quality, then what the 2025 zoning permits on the specific plot, then the rental economics. Market momentum is a tailwind — not a due-diligence substitute. See [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan) for the checklist that applies equally whichever island you choose.",
    ],
    takeaways: [
      "Samui: mature market (~117 active projects, 2,882 units), average villa ฿22.1M, net yields 5–8%, 7–9% capital appreciation forecast for 2026 — highest prices, deepest liquidity.",
      "Phangan: growth-phase market (41 projects, 438 units, ฿7.94B), house prices +8.9% YoY, western coast land up 2–4× since 2022 — more upside, less liquid, thinner margin for error.",
      "Koh Tao: dive-tourism economy, average house ฿12.68M, tiny formal property market, illiquid, strong environmental constraints — lifestyle purchase, not a yield or appreciation play.",
      "Foreign ownership rules are identical across all three islands: leasehold + superficies is the clean structure; nominee companies carry criminal risk on Samui, Phangan and Tao alike.",
      "Market growth on any island is a tailwind — not a due-diligence substitute: title, zoning, legal structure and exit liquidity determine whether an individual deal is sound.",
    ],
    sources: [
      {
        title: "Nation Thailand — Samui and Phangan boom as 61bn-baht property investment hub (2026)",
        url: "https://www.nationthailand.com/business/property/40066940",
      },
      {
        title: "Horizon Homes Koh Samui — Koh Samui Property Market 2026: Investment Guide with Real Data",
        url: "https://www.horizonhomes-samui.com/koh-samui-property-market-2026/",
      },
      {
        title: "Conrad Properties — Koh Samui Real Estate Forecast 2026",
        url: "https://www.conradproperties.asia/blog-news/koh-samui-real-estate-market-forecast-2026",
      },
      {
        title: "Charlesdel.com — Koh Samui Property Market 2026: Real Estate Trends, Prices, Ownership",
        url: "https://charlesdel.com/koh-samui-property-market/",
      },
      {
        title: "kohphangan.estate — Annual Housing Appreciation on Koh Phangan: Key Drivers, Market Trends & Investment Insights",
        url: "https://kohphangan.estate/blog/tpost/de0ng2hti1-annual-housing-appreciation-on-koh-phang",
      },
      {
        title: "Own Property Abroad — Buying Property in Koh Tao, Thailand: A Complete Guide",
        url: "https://ownpropertyabroad.com/thailand/buy-property-in-koh-tao/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion:
      "How do Koh Phangan, Koh Samui and Koh Tao compare for property investment?",
  },
  {
    slug: "land-vs-villa-vs-off-plan-choosing",
    kbId: "kb-0034",
    topic: "Process",
    title: "Land plot, finished villa or off-plan: choosing the right Koh Phangan purchase for your goal",
    short:
      "Three entry points, three different risk and reward profiles. A land plot gives maximum design control at the cost of an 18–36-month process and full construction risk. A finished villa gives certainty and immediate income at a higher entry price. Off-plan sits between them: lower price than finished, staged payments, but the same builder risk as a self-build with less control. The right choice depends on your timeline, capital, tolerance for uncertainty and what you need the asset to do.",
    updated: "2026-06-27",
    body: [
      "Most buyers on Koh Phangan come in through one of three entry points: buying a raw land plot and building, buying a completed resale villa, or buying a unit in a project not yet finished (off-plan). The legal wrapper is the same for all three — a 30-year registered lease plus ownership of the building through a registered superficies (see [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa)) — but the risk profile, the timeline to income or occupancy, and the due diligence required are substantially different.",
      { h: "Land plot: maximum control, maximum lead time" },
      "Buying a land plot means buying the right to build — a different asset from a finished building. A foreign lessee can build on a leasehold plot with the landowner's written consent; the construction permit (Por. Ror. 1) is issued in the builder's name and, combined with a registered superficies, creates the building ownership that a resale buyer gets automatically.",
      {
        ul: [
          "**Timeline**: end-to-end from plot purchase to move-in realistically takes 18–36 months. Design brief and architect engagement (1–2 months), detailed design (2–4 months), permit approval (4–6 months for a standard build; longer if the 2025 zoning triggers an environmental review), construction (6–18 months depending on scale and finish).",
          "**Build cost**: construction on Koh Phangan runs ฿18,000–25,000/m² (basic), ฿25,000–40,000/m² (mid-range Western standard), ฿40,000–60,000+/m² (premium). These figures exclude the pool (฿400,000–800,000+), professional fees — architect, engineer, project manager (8–15% of build cost) — external works and permits. The island adds an 8–15% logistics uplift over mainland construction costs for the same spec.",
          "**What you control**: plot selection, design, specification and quality. This is the only route to the exact villa you want on the exact land you chose.",
          "**What you take on**: full construction risk, budget-overrun exposure and scheduling uncertainty. Tropical construction faces wet-season delays; specialist trades on the island must often be ferried from the mainland; materials arrive by barge. Each of these creates schedule risk that a buyer of a finished building does not carry.",
          "**Zoning must come first**: before committing to a plot, confirm the zone and what it permits. The 2025 environmental rules impose hard limits above 80 m elevation (6 m max height, 50% green space minimum) and above 140 m (90 m² footprint cap). A plot you can't build the intended villa on is not the asset you priced it as. See [Building zones on Koh Phangan](/knowledge/koh-phangan-building-zones) and [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan).",
        ],
      },
      "Land suits a buyer with the time, budget certainty and appetite to manage a build project — or one who wants to minimise upfront capital by funding the asset in stages. It is not the right entry for anyone who needs rental income quickly or who wants a fixed, verifiable asset today.",
      { h: "Finished villa (resale): certainty and immediate income" },
      "A completed resale villa is what most buyers picture: a building you can see, inspect and move into or rent out immediately after closing. The price is higher than an equivalent off-plan unit at launch, but what you're paying for is certainty — a known asset with a verifiable condition, existing permits and no construction risk.",
      {
        ul: [
          "**Timeline to income**: from Land Office registration — which takes one day — the villa can generate rental income or be occupied. Zero construction delay.",
          "**Due diligence additions**: for a completed villa, due diligence adds a structural inspection and a check that the construction permit (Por. Ror. 1) exists and covers what was actually built. Unpermitted extensions are common on older stock and transfer to the buyer at sale. See [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan).",
          "**Price premium over off-plan**: a resale villa commands 15–25% more than an equivalent off-plan at launch for the same spec and location — the premium is the cost of certainty. In a rising market, off-plan buyers who sell on completion can pocket that differential.",
          "**Renovation**: older stock may need updating. Factor in renovation cost and the island logistics uplift when evaluating a lower-priced resale against a newer completed property.",
        ],
      },
      "Resale suits a buyer who wants the asset working now — generating income, being occupied, or holding as a verifiable equity position — and who does not want to manage a construction project.",
      { h: "Off-plan: lower entry price, deferred income, developer risk" },
      "Off-plan means buying a promise: a unit in a development that hasn't been built yet, or is mid-construction. On Koh Phangan, most new villa and condominium projects are sold this way — developers use pre-sales to fund construction, offering buyers a price discount in exchange for the risk and the wait.",
      {
        ul: [
          "**Price discount vs completed**: buyers who come in at the earliest phase typically pay 15–30% below the estimated market value of a completed unit. In a rising market, that discount can have been exceeded by price appreciation by the time the project completes — if it completes on time and to spec.",
          "**Payment structure**: staged against construction milestones. A typical structure: 20–30% on signing, the remainder in 2–4 tranches tied to construction progress, final 10% on handover. This spreads the cash-flow requirement over 12–24 months.",
          "**No income during construction**: from signing to handover is typically 12–24 months. During this period you hold a legal right but no income-generating or occupiable asset.",
          "**Developer risk is the key variable**: the developer's financial strength, their completed track record (projects finished and handed over, not just rendered and marketed), and the land title and building permits under the project are what determine whether the discount is real. See [Buying off-plan on Koh Phangan](/knowledge/buying-off-plan-new-developments).",
          "**Legal structure is still the same**: your leasehold and superficies are registered on completion. Confirm exactly how the unit is titled to you at handover, not just at signing. The unit still sits on a piece of land with its own title, under the same 2025 zoning rules.",
        ],
      },
      "Off-plan suits a buyer with a medium-term horizon (2–3 years to completion then rental income), the financial capacity to commit cash through staged payments without needing returns during construction, and the discipline to vet the developer properly before signing.",
      { h: "Choosing by goal" },
      {
        ul: [
          "**I want to live in it immediately**: finished resale.",
          "**I want rental income from day one**: finished resale.",
          "**I want to build exactly the villa I have in mind, and have 18–36 months**: land plot.",
          "**I want to minimise upfront capital and spread payments**: off-plan (or land with a phased build).",
          "**I want maximum capital appreciation from a rising market**: off-plan bought early in the cycle, or land in the right location ahead of a demand wave.",
          "**I want certainty above all**: finished resale.",
          "**I trust a specific developer or project**: off-plan.",
        ],
      },
      "None of the three is universally better. In a rising market, all three can perform — but the route to that return is different, and the failure modes are distinct. A self-build that runs 50% over budget because of island logistics is a poor outcome; an off-plan from a developer who runs out of money is worse. A resale bought 15% above the seller's price two years ago and immediately generating 7% net yield is a clean outcome. Match the entry type to your goals, timeline and risk tolerance — not to which option sounds most exciting.",
      "For the buying process once you've decided the entry type, see [How to buy property on Koh Phangan step by step](/knowledge/how-to-buy-property-step-by-step). For how land is valued and what moves the price on any specific plot, see [How land is priced on Koh Phangan](/knowledge/how-land-is-priced-price-per-rai).",
    ],
    takeaways: [
      "A land plot gives full design control at the cost of 18–36 months and full construction risk — budget ฿18,000–60,000+/m² plus an 8–15% island logistics uplift, pool and professional fees extra.",
      "A finished resale villa delivers immediate occupancy or income, zero construction risk and a verifiable asset — at a 15–25% premium over equivalent off-plan launch pricing.",
      "Off-plan offers a 15–30% discount to completed value and staged payments — at the cost of 12–24 months without income and full exposure to developer risk.",
      "Verify the developer's completed track record and the land title and building permits before signing any off-plan — the discount means nothing if the project doesn't complete.",
      "Zoning applies to all three entry types: confirm what the 2025 environmental rules permit on the specific plot before committing to land or off-plan, not after.",
    ],
    sources: [
      {
        title: "SunwayEstates — Off-Plan VS Completed: Which is best when buying in Thailand",
        url: "https://sunwayestates.com/blog/post/which-type-of-property-is-better-to-buy-in-thailand-off-plan-or-completed",
      },
      {
        title: "Alestriaproperty — Off-Plan vs Completed Property in Thailand: Which Is Better?",
        url: "https://alestriaproperty.com/blog/off-plan-vs-completed-property-thailand",
      },
      {
        title: "Conrad Properties — Buying Off-Plan Property in Koh Samui: Guide, Risks & Investment Potential",
        url: "https://www.conradproperties.asia/blog-news/buying-off-plan-property-koh-samui-investment-guide",
      },
      {
        title: "Thaim To Build — Cost to Build a Villa in Phuket vs Samui vs Koh Phangan (Price/m² 2025)",
        url: "https://thaimtobuild.com/villa-build-cost-phuket-samui-koh-phangan",
      },
      {
        title: "Building Control Act B.E. 2522 — permit required before construction; 45-day review period (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "process",
    faqQuestion:
      "Should I buy a land plot, a finished villa or off-plan on Koh Phangan, and how do I choose?",
  },
  {
    slug: "freehold-condo-vs-leasehold-villa",
    kbId: "kb-0035",
    topic: "Ownership",
    title: "Freehold condo vs leasehold villa for a foreigner: the real difference",
    short:
      "A foreigner in Thailand can own a condominium unit with a permanent title — no expiry, full resale rights. A villa sits on leased land with a 30-year registered term. The choice turns on budget, time horizon, lifestyle and how much legal complexity you want to carry.",
    updated: "2026-06-28",
    body: [
      "Thailand gives foreign buyers two legitimate paths to residential property: a **freehold condominium unit** under the Condominium Act, or a **leasehold villa** on a registered 30-year land lease combined with building ownership. Each is genuinely distinct — in legal permanence, transfer costs, resale dynamics and practical day-to-day reality. Understanding the difference before choosing is one of the most important decisions you will make.",
      { h: "What 'freehold' actually means for a foreigner in Thailand" },
      "A freehold condominium gives a foreigner a permanent registered title at the Land Office — a Chanote in their own name, with no expiry date. They own the unit outright and can sell, rent, mortgage or bequeath it without any lease running out. This is as close to outright property ownership as Thai law allows a foreigner to get.",
      "The critical caveat: this freehold covers the **unit only**, not the land beneath the building. That land is held by the building's juristic entity. 'Freehold' for a foreigner in Thailand is therefore not the same thing as freehold in the UK, Australia or Europe, where owning a house means owning the land too.",
      "A **leasehold villa** is different in kind. The foreigner owns the building, registered through a superficies or construction permit, but holds the land via a 30-year lease registered at the Land Office. The lease is a time-limited right — it expires, and renewal beyond the first 30-year term is a contractual promise from the landowner, not a registered property right.",
      { h: "The 49% quota rule for condominiums" },
      "Under the Condominium Act B.E. 2522, foreigners can collectively own no more than 49% of the total sellable floor area in any registered condominium project. The quota is project-specific and calculated by floor area, not unit count — a larger unit consumes proportionally more quota. Before paying any deposit, request written quota confirmation from the project's juristic office.",
      "When a project's 49% quota is exhausted, remaining units can still be purchased by foreigners — but only on a leasehold basis, not freehold. The headline price may look the same; the legal reality is different.",
      "Proposals to raise the foreign quota to 60–75% in certain resort zones have been under government review since 2024. As of mid-2026, these proposals remain unenacted. The operative rule for any purchase is still 49% — verify with the Land Department or a licensed Thai lawyer before assuming any change applies.",
      { h: "The 2025 Supreme Court ruling on leasehold renewals" },
      "In March 2025, the Thai Supreme Court (Case No. 4655/2566) confirmed that clauses in lease agreements providing for 'automatic renewal' beyond the initial 30-year term are unenforceable. A renewal promise is a **personal contractual obligation** between the lessor and lessee — it is not a registered property right and is not binding on a new owner if the landowner sells or dies.",
      "This ruling directly affects the commonly marketed '30 + 30 + 30' or '90-year lease' structure. The first 30-year registered term is legally secure. The second and third terms require a new agreement executed at the end of each prior term, with the then-landowner's cooperation. If cooperation is withheld or the land changes hands, the tenant's recourse is a contractual claim, not a property right.",
      "The remedy is to combine the lease with a registered **superficies** — which protects your ownership of the building independently — and to negotiate explicit renewal penalty clauses with specific performance provisions. A well-drafted contract mitigates but does not eliminate the renewal risk.",
      { h: "Transfer costs compared" },
      {
        ul: [
          "**Condo freehold purchase** — the main buyer cost is the transfer fee of 2% of the Land Department's appraised value. Sellers typically pay a Specific Business Tax (3.3% if they have owned less than 5 years) or stamp duty (0.5% if 5+ years) plus withholding tax (~1%). In practice, parties often split the 2% transfer fee, making the buyer's net one-time transaction cost roughly 1–1.5% of appraised value.",
          "**Leasehold villa purchase** — the main registration cost is the lease registration fee of 1% of the total lease value, plus stamp duty of 0.1%, totalling 1.1%. This is calculated on the total amount paid for the lease (not on a separate land value), which typically keeps the cost lower in percentage terms than a condo transfer fee.",
          "**Annual land and building tax** — for a condo used as a primary residence, the rate is 0.02–0.10% of appraised value annually. For a leasehold villa used as a vacation rental, the rate is 0.30–0.70%. See [Owner's taxes on Koh Phangan](/knowledge/owners-taxes-annual-land-and-income) for the full picture.",
        ],
      },
      "All purchase funds — for either structure — must be transferred from overseas in foreign currency and converted to Thai Baht on arrival. The Foreign Exchange Transaction (FET) form must be obtained from the receiving bank and match the buyer's name exactly. It is a mandatory document at the Land Office. See [Bringing money into Thailand correctly](/knowledge/bringing-money-into-thailand-fet-form).",
      { h: "Resale and liquidity" },
      "A freehold condo unit can be resold to any buyer — Thai or foreign — at any time, with no expiring term to factor in. The buyer pool is wide and the resale process mirrors the initial purchase. Value does not diminish simply because time has passed, as it would with a shortening lease.",
      "A leasehold villa's resale position depends critically on the remaining term. A lease with 28 of 30 years remaining is straightforward to sell. The same lease with 8 years remaining is nearly unsaleable to most buyers — the term is too short to justify the purchase price. This is the deepest structural difference between the two products and the one most underappreciated at the time of initial purchase. See [Selling your leasehold villa on Koh Phangan](/knowledge/selling-leasehold-villa-exit-liquidity).",
      { h: "Inheritance" },
      "A freehold condo can be inherited by foreign heirs, but they must satisfy the 49% foreign quota at the time of inheritance. If the project's quota is full when the estate is settled, heirs may be required to sell the unit (Thai law gives time to do so). A Thai heir has no such constraint.",
      "A leasehold villa can pass to heirs only if the lease contract explicitly allows assignment to the lessee's estate and successors. If the contract is silent, heirs may have no right to the remaining lease term. This is a non-negotiable clause to include when signing the original lease.",
      { h: "Which is right for which buyer" },
      {
        ul: [
          "**Budget below ~8M THB** — a condo is often the only viable fully legal option. Villa supply in this range on Koh Phangan is thin, and any 'villa' at this price point deserves extra legal scrutiny.",
          "**Legal certainty priority, medium-term horizon (under 10 years)** — a freehold condo. Permanent title, broader resale market, no depreciating lease term.",
          "**Lifestyle: space, pool, garden, privacy** — a leasehold villa. The villa product on Koh Phangan is simply not available in freehold; the 49% quota applies only to condominium projects, and most of the island's residential market is villa-format on leased land.",
          "**Rental income focus (30-day+ stays)** — a villa typically generates stronger gross yield on a larger property. For stays under 30 days a hotel licence is required regardless of property type. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
          "**Long-term horizon (10–30 years), family, primary residence** — a leasehold villa with a well-drafted contract and registered superficies, combined with serious legal advice on the renewal provisions.",
        ],
      },
      "On Koh Phangan specifically, registered condominium projects are fewer than on Koh Samui or in Phuket, and the foreign-quota supply of freehold units is limited. Most foreign buyers on the island are purchasing leasehold villas. If you are specifically seeking a freehold title on Koh Phangan, confirm the project is a registered condominium under the Condominium Act (not just a building marketed as a 'condo') before proceeding. See [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa) and [Leasehold vs freehold on Koh Phangan](/knowledge/leasehold-vs-freehold).",
    ],
    takeaways: [
      "A freehold condo gives a foreigner a permanent registered Chanote title with no expiry — but only within the 49% foreign-ownership quota per project, and only for the unit (not the land).",
      "A leasehold villa gives a 30-year registered term on the land plus ownership of the building; the 2025 Supreme Court ruling confirmed that '30+30+30' auto-renewal clauses are unenforceable beyond the first term.",
      "Condo transfer costs ~2% of appraised value; leasehold registration costs ~1.1% of total lease value — both are on top of any negotiated purchase price.",
      "Condo resale is simpler and time-independent; leasehold resale value shrinks materially as the remaining term falls — factor this in when you buy.",
      "On Koh Phangan, most of the property market is leasehold villas; freehold condo quota is limited — confirm project registration before committing.",
    ],
    sources: [
      {
        title: "Lex Bangkok — Can Foreigners Buy Condominiums in Thailand? (2025)",
        url: "https://lexbangkok.com/can-foreigners-buy-condominiums-in-thailand/",
      },
      {
        title: "Themis Partner — Thailand Condominium Act: Guide for Foreign Buyers 2025",
        url: "https://thailand.themispartner.com/guides/thailand-condominium-act-guide-foreign-buyers/",
      },
      {
        title: "Formichella & Sritawat — Thai Supreme Court Shuts Door on Long-Term Lease Loopholes (2025)",
        url: "https://fosrlaw.com/2025/supreme-court-lease/",
      },
      {
        title: "Jirawat Law — Thailand 30-Year Lease Agreements: Rights, Risks & Renewals",
        url: "https://jirawatlawoffice.co.th/understanding-30-year-leasehold-agreements/",
      },
      {
        title: "Forbes & Partners — Thailand Property Transfer Fees & Tax Guide 2025/2026",
        url: "https://www.forbesandpartners.com/thailand-property-transfer-cost-tax-breakdown/",
      },
      {
        title: "Siam Real Estate — Condos vs Villas in Thailand 2025",
        url: "https://www.siamrealestate.com/thailand-property-news/condos-vs-villas-in-thailand-a-comprehensive-guide-to-property-ownership-for-foreigners-in-2025",
      },
    ],
    faqHref: "/faq",
    faqCategory: "ownership",
    faqQuestion:
      "Should I buy a freehold condo or a leasehold villa as a foreigner in Thailand?",
  },
  {
    slug: "phangan-market-seasonality",
    kbId: "kb-0036",
    topic: "Costs",
    title: "Koh Phangan property market seasonality: when to buy and when to sell",
    short:
      "Koh Phangan has a pronounced tourist high season (December–April) and a wet-season low (May–October). Short-term rental revenue varies by 2–3× between peak and trough months. Understanding the rhythm helps you time a purchase, set rental expectations and negotiate correctly.",
    updated: "2026-06-28",
    body: [
      "Koh Phangan's property market operates in two overlapping rhythms: **tourist seasonality** (which drives rental income) and **buyer activity seasonality** (which shapes when deals happen and who has negotiating leverage). They are correlated but not identical. Getting both right matters whether you are buying for personal use, rental income, or eventual resale.",
      { h: "The tourist calendar" },
      {
        ul: [
          "**Peak season (December–April)** — the island's dry months, warm water, clear skies, hotel occupancy reaching 85–90% at the April Full Moon Party and Songkran combination. December–January is the single highest revenue period for short-stay rentals; hotels and villas charge 50%+ above low-season rates.",
          "**Secondary peak (July–August)** — Northern Hemisphere school holidays generate a meaningful second wave of European and international visitors, pushing occupancy above shoulder-season levels.",
          "**Low season (May–October/November)** — the southwest monsoon brings consistent rain and rough seas on the western coast. November is the wettest month of the year (around 520–560 mm of rainfall). May, September, October and November see the fewest tourists and the lowest rental rates.",
          "**Shoulder (March and November)** — weather transitions. March is still largely dry but visitor numbers taper from the January peak. November is wet but the island empties before December picks up.",
        ],
      },
      "The Full Moon Party (held monthly at Haad Rin beach) runs year-round and creates a consistent demand spike — approximately 5,000–20,000 attendees in regular months, up to 30,000–40,000 in high season. Properties near Haad Rin see 2–3 night booking spikes with minimum-stay requirements for FMP dates. Across the island, FMP provides a base of demand even in the weakest months, though its impact on a hillside villa in Sri Thanu or Haad Yao is much smaller than on accommodation close to the party.",
      { h: "Rental income by season: what the data shows" },
      "Short-term rental data (Airbtics, AirROI, AirDNA) paints a consistent picture of sharp seasonal variation:",
      {
        ul: [
          "**Peak month revenue (January)** — a well-positioned property on major platforms can generate approximately THB 130,000–160,000 gross in January, with occupancy above 50% even at premium nightly rates.",
          "**Low month revenue (May)** — the same property may generate THB 50,000–55,000 in May, at reduced rates and lower occupancy. Revenue is roughly 35–40% of the January peak.",
          "**Annual median** — AirDNA's market score for Koh Phangan is 89/100, with a seasonality score of 70/100 (moderate-to-high seasonality). Market-wide occupancy averages around 57% annually, with active listings growing at around 40% year-on-year — a supply expansion that is compressing per-unit revenue even as total market revenue grows.",
          "**Location premium** — properties near Secret Beach, Haad Yao and Haad Salad outperform the island average by 30–47% in nightly rates, driven by sunset sea views and premium guest profiles.",
        ],
      },
      "The supply growth is a material risk for investors buying in 2025–2026. Active listings on Airbnb-type platforms grew approximately 39–41% year-on-year. This means that overall market revenue is rising while revenue per individual listing is compressing. New buyers should use actual occupancy and revenue data from comparable current listings — not developer projections — when underwriting a rental income case. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes).",
      { h: "Buyer activity and deal timing" },
      "Most purchase decisions on Koh Phangan are made by buyers who first visited the island as tourists. The visitor season and the buyer activity season are therefore broadly aligned: agents are busiest during the high season (December–April), when foreign tourists are on the island, falling in love with a view, and starting conversations about buying.",
      "The counterpart is that the wet season (May–October) typically brings fewer competing buyers. Sellers — particularly those who rely on rental income to cover holding costs — are under more financial pressure during slow months. Historically, buyers have been able to negotiate 10–20% off asking prices through direct negotiation, and the wet season can offer more leverage than the peak when sellers have fewer alternatives.",
      "In the 2022–2025 bull market, the pronounced wet-season discount largely disappeared — demand from European and Israeli buyers remained year-round, keeping seller confidence high. As supply growth continues, the dynamic is likely shifting back toward more conventional seasonality in negotiating power. Track the inventory closely: if a property has been listed through multiple high seasons without selling, that is a stronger negotiating signal than seasonality alone.",
      { h: "What changes with the 2025 supply environment" },
      "The Koh Phangan market entered 2025–2026 with 41 active residential projects comprising 438 units and a combined development value of THB 7.94 billion — a significant pipeline for an island with historically constrained supply. New villa supply is simultaneously competing for the same rental demand base that existing properties are targeting.",
      "For a buyer whose financial plan depends on rental income, this means: run conservative occupancy assumptions (55–65% rather than the 70–80% figures sometimes quoted by developers for premium properties); cross-check any projected nightly rates against current live listings for comparable properties; and factor in a hotel licence requirement for any rental of under 30 days. See [Owner's taxes on Koh Phangan](/knowledge/owners-taxes-annual-land-and-income).",
      { h: "Practical timing guidance" },
      {
        ul: [
          "**Best time to visit before buying** — arrive in the wet season (June–September). You will see the island honestly, fewer competing buyers are around, and motivated sellers are more negotiable. Then return in high season before signing anything — the experience of living there in December is also important to know.",
          "**Best time to list for sale** — early high season (November–December). International buyers are arriving; agents are active; the island looks its best.",
          "**Rental occupancy expectations** — model on 55–65% annual occupancy for a well-managed villa in an above-average location. Properties in the top 10% of their category can exceed 80%, but this requires active management, competitive pricing and strong platform presence across high and low seasons.",
          "**Off-season negotiations** — a seller who has held a property through one or two wet seasons without a buyer is likely more flexible. Length of time on market matters more than which month you make the offer.",
        ],
      },
      "Whatever timing you choose, the fundamentals apply year-round: clean title, correct legal structure, and zoning compliance are not seasonal variables. See [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan) for the checklist, and [How land is priced on Koh Phangan](/knowledge/how-land-is-priced-price-per-rai) for context on what drives value independent of season.",
    ],
    takeaways: [
      "Peak rental season is December–April; the single highest revenue month is January. Low season is May–October, with November the wettest month (~520–560 mm rainfall).",
      "Short-term rental revenue varies by roughly 2.5–3× between January (peak) and May (trough) on a comparable well-positioned property.",
      "Active short-stay listings grew ~40% year-on-year in 2024–2025 — supply expansion is compressing per-unit income even as total market revenue grows; underwrite conservatively.",
      "Most buyer activity happens in high season when tourists visit and fall in love; the wet season typically offers more negotiating leverage and fewer competing buyers.",
      "Timing is a secondary factor — legal structure, title quality and zoning compliance are the primary variables that determine whether a deal is sound.",
    ],
    sources: [
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
      {
        title: "AirROI — Ko Pha Ngan short-term rental analysis 2025",
        url: "https://www.airroi.com/report/world/thailand/surat-thani/ko-pha-ngan",
      },
      {
        title: "AirDNA — Ko Pha Ngan market overview",
        url: "https://www.airdna.co/vacation-rental-data/app/th/default/ko-pha-ngan/overview",
      },
      {
        title: "Samui Phangan Real Estate — Koh Phangan property investment",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-property-investment/",
      },
      {
        title: "Full Moon Party Koh Phangan — upcoming dates and attendance",
        url: "https://fullmoonparty-kohphangan.com/upcoming-dates.html",
      },
      {
        title: "Bestbkkcondos — negotiating a property purchase on Koh Phangan",
        url: "https://bestbkkcondos.com/negotiating-the-purchase-price-of-a-property-in-koh-phangan/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion:
      "When is the best time to buy or sell property on Koh Phangan, and how does the tourist season affect rental income?",
  },
  {
    slug: "buying-in-madeau-wan",
    kbId: "kb-0037",
    topic: "Phangan",
    title: "Buying in Madeau Wan: the island's quiet inland residential district",
    short:
      "Madeau Wan is an inland village 5–10 minutes from Thong Sala — jungle-set villas and plots at a fraction of west-coast beachfront prices. Flat terrain, government electricity nearby, and less coastal-zone exposure than its beach neighbours.",
    updated: "2026-06-29",
    body: [
      "Madeau Wan — named after Wat Maduea Wan, the Buddhist temple at its centre — is a quiet inland residential district on the west side of Koh Phangan. It is not a beach area: the nearest swimming is a three-minute scooter ride to Hin Kong Bay. What it offers instead is proximity to Thong Sala (5–10 minutes), proximity to the island's public hospital (about 2 minutes), and a settled, green, community-oriented atmosphere without the wellness-community branding of Sri Thanu or the tourist-season crowd of the western beaches.",
      "The land market in Madeau Wan divides into two tiers. Raw coconut-grove and garden plots — typically flat, quarter-rai to one-rai in size — offer the lowest entry prices on the accessible west side of the island. Above that sits a growing number of completed and off-plan pool villas in boutique micro-developments of 5–15 units, several clustered near the temple.",
      { h: "What the district actually feels like" },
      "The terrain is mostly flat to gently rolling — a meaningful difference from hillside or elevated districts on the island. Jungle vegetation and coconut palms are typical. There is no through-traffic and no tourism infrastructure; the district has a genuinely local Thai-village feel, particularly around the temple. Road access to Thong Sala uses paved island roads; some plots have their last-100-metres access on well-maintained dirt tracks.",
      { h: "Infrastructure" },
      {
        ul: [
          "**Electricity** — government three-phase supply is available in the area; boutique developments install their own transformers. Some raw plots have the grid connection 50–80 m from the boundary.",
          "**Water** — piped water is present in more developed areas and in organised villa projects. For raw land, deep-well drilling is the standard approach.",
          "**Roads** — main-road access to Thong Sala via Tessaban-maintained paved roads. Last-leg access can be a sealed or dirt track depending on the plot.",
          "**Internet** — fibre-optic available in more developed plots; 4G mobile coverage (AIS/DTAC/True) is standard across the area.",
          "**Hospital** — approximately 2 minutes by scooter to Koh Phangan Public Hospital — the shortest distance of any residential district.",
          "**Town** — Thong Sala's markets, bank, ATMs, and ferry pier: 5–10 minutes.",
        ],
      },
      { h: "Zoning and building rules" },
      "Flat, low-elevation plots in Madeau Wan sit outside the two most restrictive zones created by the May 2025 environmental protection regulation for Koh Phangan. The coastal Zone 2 rules (setbacks, 50–75% green space, wastewater requirements) apply to shoreline land — not to inland plots here. The hillside Zone 3 rules (6 m height cap, 50% green space minimum, no subdivision) apply from 80 m elevation — which also excludes the flat coconut-grove parcels. This makes Madeau Wan among the less-restricted land for new residential development on the island, though buyers must verify the specific elevation and zone designation of any plot with a Thai property lawyer. Hillside extensions of the district that rise toward the island's interior would attract Zone 3 rules. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones) for the full regulatory map.",
      { h: "Who buys here" },
      {
        ul: [
          "**Established island residents** who already know Phangan and want more space, lower land cost, and a quiet community without sacrificing access to town services.",
          "**Families** attracted by the proximity to the hospital, the quieter environment, and the short drive to the international school near Hin Kong.",
          "**Value-oriented self-builders** who want a flat, accessible plot with reasonable utility access — and find inland pricing 3–5× lower per rai than equivalent proximity on the west-coast beachfront.",
          "**Boutique villa developers** building small projects (5–15 units) targeting the rental or resale market at the island's accessible middle price point.",
        ],
      },
      { h: "What to check before buying" },
      "In addition to the standard [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan), Madeau Wan buyers should confirm: the road access arrangement for the specific plot (paved or dirt, and who maintains it); the nearest electricity connection point and any grid-connection costs; whether water is from a mains supply or requires drilling; and the exact zone classification under the 2025 regulation.",
      "Foreign buyers use the same [leasehold structure](/knowledge/how-foreigners-own-a-villa) as elsewhere on the island — 30-year registered land lease with registered superficies or ownership of the structure. The 2025 enforcement against nominee Thai companies applies here as everywhere. See [A Thai company for property](/knowledge/thai-company-for-property-49-51) for why that structure is increasingly inadvisable.",
    ],
    takeaways: [
      "Madeau Wan is 5–10 minutes from Thong Sala and 2 minutes from the public hospital — among the best-serviced inland locations on the island.",
      "Flat terrain means plots are generally outside the hillside Zone 3 building restrictions (6 m height cap, no-subdivision rules) that constrain highland and west-coast hillside sites.",
      "Land prices run 3–5× lower per rai than comparable-proximity west-coast beachfront, making it the most accessible route to the island's west-side residential community.",
      "Water supply for raw plots typically requires deep-well drilling; government electricity is nearby but connection costs vary by plot.",
      "Buyers are primarily established residents, families, and self-builders — not beach-lifestyle or wellness-community seekers.",
    ],
    sources: [
      {
        title: "Conrad Properties — properties in Madua Wan, Koh Phangan",
        url: "https://www.conradproperties.asia/search/thailand/koh-phangan/south-west/madua-wan",
      },
      {
        title: "Phangan Land and Home — Meaduawan area listings",
        url: "https://phanganlandandhome.com/area/meaduawan/",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Samui, Koh Phangan & Koh Tao",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
      {
        title: "Nation Thailand — Koh Phangan market reaches THB 7.94 billion",
        url: "https://www.nationthailand.com/business/property/40067434",
      },
      {
        title: "Islanders Properties — best areas to live on Koh Phangan",
        url: "https://islanders-properties.com/blog/koh-phangan-areas-84",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Madeau Wan like and who is it for as a buyer on Koh Phangan?",
  },
  {
    slug: "buying-in-haad-rin",
    kbId: "kb-0038",
    topic: "Phangan",
    title: "Buying in Haad Rin: Full Moon Party peninsula — investor guide",
    short:
      "Haad Rin occupies the south-eastern tip of Koh Phangan and is synonymous with the monthly Full Moon Party. It suits short-term rental investors who understand a party economy; it is not suited to families, quiet-lifestyle buyers, or anyone relying on easy road access.",
    updated: "2026-06-29",
    body: [
      "Haad Rin is the most famous district on Koh Phangan and the least suitable for most buyers. The Full Moon Party — held on Haad Rin Nok (Sunrise Beach) every month, attracting 20,000–40,000 people — drives the entire local economy and defines the investment case for property here. If the party is the point, Haad Rin delivers. If it is a liability, it is the wrong district.",
      "The peninsula sits approximately 11–13 km from Thong Sala and is reached by a steep mountain road with gradients approaching 1-in-4 in places — steep enough that laden motorbikes regularly struggle and travel guides explicitly warn inexperienced riders. Travel time by songthaew is around 30 minutes each way (100–150 THB per person). An alternative is by sea: the Haad Rin Nai pier on the Sunset side receives longtail and passenger boats from Koh Samui (30–60 minutes) and hosts dedicated party ferries around Full Moon dates.",
      { h: "Two beaches, two different investments" },
      {
        ul: [
          "**Haad Rin Nok (Sunrise Beach)** — east-facing, fine white sand, and the party venue. Beach bars and clubs operate from afternoon until sunrise most evenings, not only on Full Moon nights. Maximum rental demand on party dates (2–3 night minimum-stay bookings are standard); maximum noise exposure for any resident. Properties on and near Nok command the strongest party-night premium but the weakest year-round livability.",
          "**Haad Rin Nai (Sunset Beach)** — west-facing, quieter, darker sand, with the boat pier and sea access. About 500 metres from the party beach. More suitable for a mixed-use or lower-density investment; some buyers use this side for properties they also intend to occupy personally. The pier access is a meaningful advantage for arriving and departing without using the road.",
        ],
      },
      { h: "The rental investment case" },
      "The Full Moon Party creates a guaranteed monthly demand spike that other island districts cannot replicate — every 28 days, tens of thousands of visitors need accommodation within walking distance. This translates into very high nightly rates for two to three nights per month and more stable year-round occupancy than a typical seasonal beach property.",
      "Island-wide, short-term rental gross yields run approximately 6–8% annually on well-managed properties, with median annual Airbnb revenue around THB 706,000 per active listing. Haad Rin area properties show roughly a 12% revenue premium over the island average — significant, but notably lower than the 30–47% premiums recorded at premium west-coast beachside locations (Haad Yao, Haad Salad, Secret Beach). The party effect is real but not the outsized yield premium some buyers expect.",
      "The important caveat: island-wide short-stay listings grew approximately 40% year-on-year in 2024–2025. Supply expansion is compressing per-unit revenue even as total market demand grows. Run conservative occupancy assumptions — 55–65% annually — and cross-check against current live listings before accepting any developer projection. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes) for the licensing and tax framework that applies.",
      { h: "Zoning and building constraints" },
      "Haad Rin's geography as a narrow peninsula tip means almost all developable land sits within scope of the May 2025 environmental protection zones. Beachfront and near-beach parcels fall under the coastal zone rules: within 10 m of the shoreline, no construction; 10–50 m, one floor maximum with a 6 m height cap and 75 sqm footprint limit; 50–200 m, up to 12 m height. The hills immediately behind the village trigger the hillside zone restrictions at 80 m elevation (6 m height cap, 50% green space, no subdivision). Any new construction or renovation that triggers a permit review will face these rules in full. Existing structures completed before 21 May 2025 are generally grandfathered absent a change of use or expansion. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones).",
      { h: "Foreign ownership and the nominee risk" },
      "The standard foreign ownership structure on Koh Phangan — 30-year registered leasehold with registered superficies — is the only advisable route. The 2025 nominee company crackdown has been particularly visible across the island: Thai authorities identified over 7,000 suspected nominee companies on Koh Samui and Koh Phangan combined; raids and coordinated inspections have resulted in property seizure proceedings, criminal charges, tax penalties, and deportations. Haad Rin's investment-driven buyer profile historically attracted less structurally careful operators — any buyer considering a Thai company structure should take independent legal advice from a qualified Thai property law firm. See [A Thai company for property](/knowledge/thai-company-for-property-49-51) and [Nominee crackdown 2026](/knowledge/nominee-crackdown-krabi-islands-2026).",
      { h: "Who should not buy here" },
      {
        ul: [
          "**Families with children** — nightly noise, party-crowd density, and a beach regularly affected by large-scale events make this unsuitable for quiet family life.",
          "**Long-term residents and digital nomads** — the wellness and co-working expat community has firmly established itself on the west coast (Sri Thanu, Haad Yao, Hin Kong, Chaloklum). Haad Rin is the opposite demographic.",
          "**Buyers relying on easy road access** — the steep route from Thong Sala is a genuine logistics constraint for deliveries, contractors, and guests with luggage.",
          "**Investors expecting a quiet low season** — the Full Moon Party runs monthly regardless of weather; the area never goes quiet in the way more residential districts do in the wet season.",
        ],
      },
    ],
    takeaways: [
      "The Full Moon Party draws 20,000–40,000 people monthly — guaranteed demand spikes for short-term rentals within walking distance, every 28 days year-round.",
      "Gross STR yields of 6–8% are achievable; the Haad Rin party premium is approximately 12% above the island average — real but not exceptional compared to premium beachfront areas elsewhere.",
      "The access road has near-1-in-4 gradients — a genuine logistics constraint that limits the audience for any property and raises operating costs.",
      "Peninsula geography means almost all land falls under coastal or hillside zone restrictions from the May 2025 environmental regulation — new supply is constrained.",
      "Nominee company structures are an active enforcement target island-wide; use registered leasehold through a qualified Thai law firm only.",
    ],
    sources: [
      {
        title: "Nation Thailand — Koh Phangan property market THB 7.94 billion",
        url: "https://www.nationthailand.com/business/property/40067434",
      },
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
      {
        title: "Islanders Properties — Haad Rin area guide",
        url: "https://islanders-properties.com/blog/haad-rin-pangan-99",
      },
      {
        title: "Wikipedia — Full Moon Party",
        url: "https://en.wikipedia.org/wiki/Full_Moon_Party",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Phangan",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-defenders-need-to-know-may-2025-update/",
      },
      {
        title: "Thai Examiner — Koh Phangan nominee company crackdown 2025",
        url: "https://www.thaiexaminer.com/thai-news-foreigners/2025/11/25/koh-phangan-crackdown-continues-as-thai-government-sends-message-small-time-investors-are-not-wanted/",
      },
      {
        title: "Better Than Freehold — Thailand nominee company crackdown 2025",
        url: "https://betterthanfreehold.com/resources/thailand-nominee-company-crackdown-koh-samui-phangan-2025",
      },
      {
        title: "Samui Phangan Real Estate — Koh Phangan investment",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-property-investment/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Is Haad Rin a good place to buy property on Koh Phangan?",
  },
  {
    slug: "buying-in-wok-tum",
    kbId: "kb-0039",
    topic: "Phangan",
    title: "Buying in Wok Tum: quiet sunset strip minutes from Thong Sala",
    short:
      "Wok Tum occupies the south-western shore of Koh Phangan, a ten-minute drive from the island's main port town. It offers mangrove-fringed sunset views, the lowest land prices on the west coast, and a genuinely quiet atmosphere — at the cost of a non-swimming shoreline and some infrastructure gaps that buyers should verify before committing.",
    updated: "2026-06-29",
    body: [
      "Wok Tum sits immediately north of Thong Sala along the island's south-western coast, sharing a wide bay with Hin Kong to the north. The combination of close proximity to the island's main service hub and a calm, undeveloped shoreline makes it one of the few areas on Koh Phangan where price, convenience, and tranquility align — though with real trade-offs buyers need to understand.",
      "The bay is mangrove-fringed rather than sandy beach, with a coral reef roughly 300 metres offshore. Swimming is possible at high tide between November and April, but Wok Tum is not a primary swim beach. What it is, consistently, is one of the island's best sunset viewpoints: on clear evenings, Angthong Marine Park and Koh Samui are visible on the horizon, and the flat water catches the light in a way the more exposed north-facing bays cannot.",
      { h: "Location and access" },
      {
        ul: [
          "**Distance to Thong Sala**: approximately 10 minutes by scooter or taxi; Koh Phangan Hospital is about 1.4 km from the district centre.",
          "**Road access**: properties connect to the main Thong Sala–Haad Yao coastal and inland roads. Some plots in the northern part of the district rely on a public dirt-road link of around 300 m — verify the access situation for any specific plot before purchase.",
          "**Water supply**: government water infrastructure has not yet reached some lower-lying parcels; well water at shallow depth is the backup in those areas. Electricity is readily available with a short extension from the main grid.",
        ],
      },
      { h: "Property market" },
      "Wok Tum is among the most affordable entry points on the west coast. Land plots (typically 0.8–1.25 rai, flat, Chanote title) have traded at around 1.4–1.5M THB per rai — a fraction of the 9–15M THB per rai commanded by premium sea-view parcels in Haad Yao or Haad Salad. Finished villa projects range from approximately 5M THB for a smaller two-bedroom unit to 8–9M THB for larger eco-luxury offerings. Beachfront-adjacent parcels carry a price premium and transact quickly when they appear.",
      "The discount relative to other west-coast areas reflects the non-swimming shoreline, partial infrastructure gaps, and lower developer interest to date — not legal or title complications, which are the same as elsewhere on the island. Chanote (Nor Sor 4) title is available and the standard for any purchase here.",
      { h: "Rental outlook" },
      "Wok Tum attracts a year-round visitor base — families and couples seeking quiet beach stays, wellness tourists moving through the west-coast corridor, and returning long-term renters who have established a connection to the area. It does not generate the monthly demand spikes of Haad Rin or the premium nightly rates of Haad Yao and Secret Beach. Island-wide short-term rental data (Airbtics, early 2026) puts median annual STR revenue at approximately 706,000 THB per active listing at 68% occupancy; Wok Tum properties are likely at or modestly below the island median given the absence of a primary swim beach. Use conservative occupancy assumptions — 55–60% — when modelling any purchase.",
      "Short-term rental listings across the island grew approximately 40% year-on-year in 2024–2025. Supply expansion is compressing per-unit revenue even as total demand grows. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes) for the licensing and tax framework that applies island-wide.",
      { h: "Zoning and building rules (May 2025)" },
      "The May 2025 environmental protection regulation applies across the island, including Wok Tum. The flat coastal parcels in the district fall under the general coastal zone rules: no construction within 10 m of the high-tide line; within 10–50 m, one storey maximum with a 6 m height cap and 75 sqm footprint limit; beyond 50 m, up to 12 m height applies. Any hillside plots above the coastal flat — where they exist in the northern part of the district — trigger the stricter hillside rules: 6 m height cap, minimum 50% green space, no subdivision. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones) for the full framework.",
      { h: "Who suits Wok Tum" },
      {
        ul: [
          "**Owner-occupiers** who want a quiet west-coast base close to Thong Sala's shops, hospital, and ferry connections without paying a beach-resort premium.",
          "**Budget-conscious investors** entering the island market at a lower price point, accepting a moderate rather than premium rental yield.",
          "**Eco-conscious and wellness buyers** drawn to the natural mangrove setting and growing community of like-minded residents.",
          "**Buyers who do not need a swimming beach** daily and value unobstructed sunset views over resort amenities.",
        ],
      },
      "Wok Tum is not the right choice for buyers prioritising short-term rental premiums, easy beach swimming, or the vibrant dining and co-working scene of Sri Thanu. For that combination, [Hin Kong](/knowledge/buying-in-hin-kong) or [Sri Thanu](/knowledge/buying-in-sri-thanu) are the closer match.",
    ],
    takeaways: [
      "Ten-minute drive from Thong Sala pier — the closest beachside district to the island's main services hub, hospital, and ferry terminal.",
      "Mangrove bay with Angthong Marine Park horizon views; excellent sunsets but not a primary swim beach — assess the shoreline in person before deciding.",
      "Land plots around 1.4–1.5M THB per rai — among the lowest entry prices on the west coast; flat terrain and Chanote title available.",
      "Rental yields are steady year-round but without premium spikes; model conservatively at 55–60% occupancy against the island median.",
      "May 2025 zoning rules apply: flat coastal parcels in the lower-restriction zone, but verify each plot's road access and water supply before purchase.",
    ],
    sources: [
      {
        title: "Koh Phangan Homes — Wok Tum area guide and listings",
        url: "https://phanganlandandhome.com/area/wok-tum-hin-kong/",
      },
      {
        title: "Welove-kohphangan.com — Ao Wok Tum beach guide",
        url: "https://www.welove-kohphangan.com/item/wok-tum-beach-koh-phangan/",
      },
      {
        title: "Islanders Properties — Koh Phangan area guide",
        url: "https://islanders-properties.com/en/blog/koh-phangan-areas-84",
      },
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Phangan",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-defenders-need-to-know-may-2025-update/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Wok Tum like as a place to buy property on Koh Phangan?",
  },
  {
    slug: "buying-in-hin-kong",
    kbId: "kb-0040",
    topic: "Phangan",
    title: "Buying in Hin Kong: Koh Phangan's longest west-coast beach",
    short:
      "Hin Kong stretches for approximately 2.4 km along the west coast between Thong Sala and Sri Thanu — the island's longest continuous west-coast beach. It combines family-friendly shallow water, a well-established international community, and direct access to the Sri Thanu wellness corridor, with mid-range west-coast land prices and straightforward road connections.",
    updated: "2026-06-29",
    body: [
      "Hin Kong sits on the west coast of Koh Phangan roughly halfway between Thong Sala to the south and Sri Thanu to the north. The beach road runs directly alongside the sand for its entire length, making it the most physically accessible west-coast stretch on the island. At around 2.4 km, it is also the longest — a meaningful distinction on an island where premium beach frontage is both finite and tightly governed since the May 2025 zoning regulations.",
      "The area transitions seamlessly into Wok Tum to the south and Sri Thanu to the north, so buyers in Hin Kong effectively buy into the full west-coast corridor. That corridor — internationally recognised as the wellness, yoga, and expat residential hub of the island — drives both the lifestyle and the rental market here.",
      { h: "Location and access" },
      {
        ul: [
          "**Distance to Thong Sala**: approximately 10 minutes by scooter, 5–6 km by road — a straightforward two-lane coastal route with no significant gradients.",
          "**Distance to Sri Thanu**: approximately 3 minutes north — Hin Kong and Sri Thanu effectively share an economy, a community, and a wellness scene.",
          "**Distance to Haad Yao**: approximately 12 minutes north — the premium beach just beyond Sri Thanu, useful context for price comparisons.",
          "**Road quality**: Hin Kong Road runs the full length of the beach with direct connections to the main west-coast road. Multiple public beach-access paths are maintained. No steep approaches or unsealed sections on the main route.",
        ],
      },
      { h: "Community and lifestyle" },
      "Hin Kong is part of the island's informal health and wellness hub. Yoga studios, vegan cafés, detox retreats, and holistic health practitioners cluster along the beach road and in Sri Thanu immediately to the north. The community is heavily international — European, Australian, and Russian-speaking residents predominate among the expat layer, alongside a traditional Thai fishing and farming population. The area is consistently cited in expat guides as the best combination of community, convenience, and calm on the island.",
      "The beach itself is shallow with a sand shelf that exposes at low tide — particularly safe for young children but not ideal for strong-water swimmers. The west-facing orientation delivers reliable sunset views across the Gulf of Thailand toward Koh Samui and, on clear days, the Angthong archipelago.",
      { h: "Property market" },
      "Land in Hin Kong runs at approximately 4M THB per rai — mid-range on the west coast, substantially below the 9–15M THB per rai of premium sea-view plots in Haad Yao or Haad Salad, and above the budget-entry flat land in Wok Tum to the south. West-coast land values broadly doubled to quadrupled between early 2022 and 2025, and Hin Kong has tracked that upward move alongside Sri Thanu.",
      "Finished villa prices range from approximately 6M THB for a two-bedroom property to 13M THB and above for larger sea-view builds. Beachfront and beach-road-fronting parcels represent the most liquid segment — those titles come up rarely and transact quickly. Chanote (Nor Sor 4) is the standard title; verify before purchase.",
      { h: "Rental outlook" },
      "No published STR data separates Hin Kong from the broader west-coast corridor, but the adjacent Chao Phao area shows approximately a 12% premium over the island median on Airbtics data. The Sri Thanu area immediately north is among the highest-cited yield zones on the island. Island-wide median annual STR revenue sits at approximately 706,000 THB per listing at 68% occupancy (Airbtics, early 2026). The wellness and long-stay demographic in Hin Kong also supports medium-term rentals of one to three months — a strategy that reduces seasonality risk compared to a pure short-stay model.",
      "Island-wide STR listings grew approximately 40% year-on-year in 2024–2025. Run conservative occupancy assumptions — 60–65% — and check live listings to calibrate against current supply. See [Renting out your villa on Koh Phangan](/knowledge/renting-out-your-villa-rules-and-taxes) for the licensing and tax framework that applies.",
      { h: "Zoning and building rules (May 2025)" },
      "The May 2025 environmental protection regulation applies across Koh Phangan. Hin Kong's flat beachfront parcels fall under the coastal zone: no construction within 10 m of the high-tide line; within 10–50 m, one storey maximum with a 6 m height cap and 75 sqm footprint limit; beyond 50 m, up to 12 m height. Hillside plots above the beach road — where they occur — trigger the stricter hillside zone rules: 6 m height cap, minimum 50% green space, no subdivision. Any new build or renovation requiring a permit will be assessed under these rules in full; structures completed before 21 May 2025 are generally grandfathered absent expansion or change of use. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones).",
      { h: "Who suits Hin Kong" },
      {
        ul: [
          "**Families with young children** — the shallow, calm beach is the safest swimming environment on the island's west coast for small children.",
          "**Long-term residents and digital nomads** — the established expat community, co-working options in Sri Thanu, and restaurant variety support a comfortable year-round lifestyle.",
          "**Wellness and yoga practitioners** — the beach road and Sri Thanu immediately to the north form the island's primary wellness corridor.",
          "**Mixed-use investors** — the long-stay and wellness rental market reduces dependence on peak-season short-stay occupancy.",
        ],
      },
      "Hin Kong is not suited to buyers chasing the highest short-term rental premiums — those lie at Secret Beach, Haad Yao, and Haad Salad — or the party-driven demand of Haad Rin. For lower entry prices with the same sunset orientation, see [Wok Tum](/knowledge/buying-in-wok-tum) immediately to the south.",
    ],
    takeaways: [
      "Longest west-coast beach at approximately 2.4 km — shallow safe water for young children and reliable sunset views year-round.",
      "Ten-minute drive from Thong Sala, three minutes from Sri Thanu — at the heart of the island's wellness corridor and strongest expat residential hub.",
      "Land around 4M THB per rai — mid-range west-coast pricing; values have tracked the 2–4× island-wide appreciation since 2022.",
      "Mixed STR and medium-term rental demand; the wellness demographic supports one-to-three-month stays that hedge seasonality risk.",
      "May 2025 coastal zoning applies: no construction within 10 m of the shoreline; hillside plots above the beach road face stricter height and green-space limits.",
    ],
    sources: [
      {
        title: "Joy Beach Villas — Hin Kong beach guide",
        url: "https://www.joybeachvillas.com/post/hin-kong-beach-guide",
      },
      {
        title: "Samui Island Realty — Hin Kong properties",
        url: "https://samui-island-realty.com/area/hin-kong/",
      },
      {
        title: "Islanders Properties — Koh Phangan area guide",
        url: "https://islanders-properties.com/en/blog/koh-phangan-areas-84",
      },
      {
        title: "Koh Phangan Homes — Wok Tum / Hin Kong area",
        url: "https://phanganlandandhome.com/area/wok-tum-hin-kong/",
      },
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
      {
        title: "Samui Phangan Real Estate — west coast market overview",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-real-estate-market/",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Phangan",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-defenders-need-to-know-may-2025-update/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Is Hin Kong a good area to buy property on Koh Phangan?",
  },
  {
    slug: "buying-in-mae-haad",
    kbId: "kb-0041",
    topic: "Phangan",
    title: "Buying in Mae Haad: Koh Ma sandbar and Koh Phangan's top snorkelling bay",
    short:
      "Mae Haad sits on Koh Phangan's north-west coast and is anchored by an 800-metre white sand beach and the famous Koh Ma sandbar — a natural tidal causeway to a small rocky island and designated marine park. The area has evolved from a quiet fishing community into an active luxury villa market, but strict hillside zoning limits density and keeps supply permanently constrained.",
    updated: "2026-06-29",
    body: [
      "Mae Haad (also written Mae Had) faces north-west on Koh Phangan, roughly 8–10 km from Thong Sala port — about 25–30 minutes by scooter. The beach is a calm 800-metre arc of white sand backed by palms, with shallow turquoise water that is among the clearest on the island. At low tide, a natural sandbar emerges connecting the main beach to Koh Ma, a rocky islet ringed by a coral reef and designated as a protected marine park — giving Mae Haad the island's most accessible snorkelling and diving just metres from shore.",
      { h: "Location and access" },
      {
        ul: [
          "**Distance to Thong Sala**: 8–10 km, approximately 25–30 minutes by scooter on the west-coast road — straightforward, largely flat approach.",
          "**Distance to Chaloklum**: approximately 20 minutes north — useful for supplies and the northern coast.",
          "**Distance to Haad Yao / Haad Salad**: approximately 15 minutes south along the coast road — the adjacent premium beach market.",
          "**Road quality**: the main west-coast route is sealed and well-maintained; the last 1–2 km to some hillside plots switches to steep concrete tracks requiring a suitable vehicle.",
        ],
      },
      { h: "Community and lifestyle" },
      "Mae Haad attracts a quieter, nature-focused demographic than the party zones of Haad Rin or the busier wellness corridor of Sri Thanu. Facilities are modest — a handful of restaurants, a dive shop or two, and the small Koh Ma marine park jetty — keeping the area peaceful and unhurried. Proximity to the snorkelling and the sandbar means the beach draws a steady stream of day-trippers, but the residential population is sparse and private.",
      "The typical buyer here is not seeking a community hub but a private retreat close to the island's best underwater landscape. The demographic is skewed toward affluent international buyers — primarily Israeli, European, and Australian — who value exclusivity, elevated sea views, and access to the water.",
      { h: "Property market" },
      "Mae Haad carries some of the island's higher north-west land prices, reflecting the sea-view premium on hillside plots above the bay. Seaview land runs approximately 8–14 M THB per rai, with panoramic Koh Ma-view parcels reaching 13–14 M THB per rai. Beachfront land commands a significant premium and rarely transacts publicly. Active luxury villa developments have emerged: the Green Valley project (Open Space Ltd, pre-sale launched March 2025) offers 12 villas starting at approximately USD 1.55 M; the AKASHA development near the area launched 3–4 bedroom villas at 11–14 M THB.",
      "Completed villa prices range from approximately 7–12 M THB for a 2-bedroom seaview property to 20 M THB and above for larger four-bedroom builds. Title is predominantly Chanote (Nor Sor 4) — verify before purchase, as hillside plots in the north-west occasionally present Nor Sor 3 Gor (see [Chanote vs Nor Sor 3 Gor in practice](/knowledge/chanote-vs-nor-sor-3-gor-practice)).",
      { h: "Zoning and building rules (May 2025)" },
      "Mae Haad's hillside terrain places most developable plots in Zone 3(1) or Zone 3(2) under the May 2025 environmental regulation — the strictest tiers on the island. Key rules for hillside zones: maximum building height 6 metres (including roof structure); one single-family dwelling per parcel; minimum 50% of the plot must remain as green space; natural-coloured roofing required; no further subdivision of land. Plots with gradients above 35% require special environmental consent before any grading or large-tree removal. New resort-style multi-unit developments are now prohibited on hillside land.",
      "Coastal parcels on the flat section directly behind the beach fall under the coastal zone: no construction within 10 m of the high-tide line; one storey maximum within 10–50 m; standard height limits beyond 50 m. Structures completed before 21 May 2025 are generally grandfathered. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones) for the full framework.",
      { h: "Rental outlook" },
      "Mae Haad is not a volume rental market — the beach is quieter than Haad Yao or Haad Salad, and the hillside villa stock targets high-end stays rather than budget short-term turnover. Developer ROI projections for luxury villas in the area run 10–15% annual net, reflecting high nightly rates and longer average stays from international visitors. Island-wide median STR annual revenue is approximately 706,000 THB at 68% occupancy (Airbtics, early 2026); luxury properties with a Koh Ma view and private pool sit materially above this figure. The marine park proximity and snorkelling access are strong marketing hooks for stays of five to fourteen days.",
      { h: "Who suits Mae Haad" },
      {
        ul: [
          "**Buyers prioritising privacy and natural beauty** — small residential population, marine park access, and hillside exclusivity.",
          "**Snorkelling and diving enthusiasts** — Koh Ma is Koh Phangan's best-documented dive and snorkel site, accessible on foot from the beach at low tide.",
          "**Luxury villa investors** — active development pipeline, strong nightly rate potential, and supply constrained by zoning make the upper segment defensible.",
          "**Buyers comfortable with hillside plots** — the best views require a steep concrete approach; a strong scooter or 4×4 is recommended.",
        ],
      },
      "Mae Haad is less suited to buyers seeking a beach-walking lifestyle or high pedestrian footfall — the area remains quiet with limited dining and shopping. For similar west-coast and north-west pricing with more community infrastructure, see [Haad Yao / Haad Salad](/knowledge/buying-in-haad-yao-haad-salad) to the south.",
    ],
    takeaways: [
      "North-west location with Koh Phangan's most accessible snorkelling — Koh Ma marine park and sandbar just metres from the beach at low tide.",
      "Hillside seaview land at approximately 8–14 M THB per rai; active luxury villa development pipeline as of 2025–2026.",
      "May 2025 zoning restricts hillside plots to one single-family home per parcel, 6 m max height, 50% green space — supply permanently constrained.",
      "25–30 minutes from Thong Sala by scooter; main road sealed, last kilometre to hillside plots may require a 4×4 or strong scooter.",
      "Quiet residential character — better suited to privacy-seeking buyers than those wanting community hubs or high footfall.",
    ],
    sources: [
      {
        title: "The Manduls — Mae Haad Beach Koh Phangan complete guide",
        url: "https://themanduls.com/mae-haad-beach-koh-phangan-the-complete-guide/",
      },
      {
        title: "3 Angels Thailand Living — Mae Haad sandbar and snorkelling guide",
        url: "https://3angelsthailandliving.com/en-mae-haad-beach-koh-phangan/",
      },
      {
        title: "Keller Henson — new villa developments Koh Phangan (AKASHA, Green Valley)",
        url: "https://kellerhenson.com/new-villas-for-sale-koh-phangan/",
      },
      {
        title: "Islanders Properties — Koh Phangan area guide",
        url: "https://islanders-properties.com/en/blog/koh-phangan-areas-84",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Phangan",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-defenders-need-to-know-may-2025-update/",
      },
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
      {
        title: "Samui Phangan Real Estate — Koh Phangan property investment overview",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-property-investment/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Is Mae Haad a good area to buy property on Koh Phangan?",
  },
  {
    slug: "buying-in-bottle-beach",
    kbId: "kb-0042",
    topic: "Phangan",
    title: "Buying in Bottle Beach (Haad Khuat): Koh Phangan's most remote north-coast bay",
    short:
      "Bottle Beach — officially Haad Khuat — is Koh Phangan's most isolated bay, reachable only by longtail boat from Chaloklum or a one-to-two-hour jungle hike. Real estate transactions here are extremely rare; the area suits buyers seeking genuine off-grid seclusion or niche eco-tourism development, not conventional investment.",
    updated: "2026-06-29",
    body: [
      "Bottle Beach (Haad Khuat) lies on Koh Phangan's north coast, tucked between steep jungle-covered headlands that plunge directly into the sea. The bay is not accessible by sealed road — the only practical route is a 10–15 minute longtail boat from Chaloklum pier, or two jungle trails (1–2.5 hours on foot) from Haad Khom beach to the west. This access reality defines everything about the property market here.",
      { h: "Location and access" },
      {
        ul: [
          "**By boat from Chaloklum**: longtail boats run approximately hourly, 09:00–16:00; cost 150–300 THB per person one way; no advance booking required. Chaloklum itself is approximately 10 km and 30 minutes from Thong Sala.",
          "**By jungle trail**: two routes from Haad Khom beach — a shorter 2 km trail (1–1.5 hours) and a longer coastal route of 3 km (2–2.5 hours). A new wooden walkway section was completed in early 2026. Good shoes and an early start are required.",
          "**By vehicle**: an informal dirt track exists but becomes impassable after rain and is not viable for regular use. Materials, workers, and supplies for any property construction must travel by boat.",
          "**Last return boat**: typically 16:00–17:00 — missing it means spending the night, as there is no other practical exit route.",
        ],
      },
      { h: "The beach and environment" },
      "Bottle Beach is a genuinely pristine bay: around 400–500 metres of pale sand, crystal-clear shallow water, and dense jungle to the tree-line. There are no paved roads, no shops or ATMs, and minimal tourist infrastructure. Six resort-style properties (bungalows and small guesthouses) operate on or near the beach; these are not private villa developments.",
      "The surrounding terrain is steep and heavily forested. The bay's geology and the May 2025 zoning restrictions both severely limit the footprint of any future development.",
      { h: "Property market reality" },
      "The real estate market at Bottle Beach is one of the thinnest on the island. Public transaction data is minimal. The most significant known listing (as of 2025) is a 40-rai (160,000 sqm) beachfront land parcel at 2 billion THB, marketed by Islanders Properties for resort or private villa development — a speculative offering at an institutional price point. There are no active off-plan villa projects, no subdivision plots targeted at individual buyers, and no reliable price-per-rai data from comparable recent sales. Any buyer considering the area should treat it as speculative land banking, not a structured investment with comparable precedent.",
      { h: "Zoning and building constraints" },
      "The May 2025 environmental protection regulation applies fully to Bottle Beach. The terrain — steep jungle slopes, coastal proximity, and likely protected forest — places most of the land in the most restrictive categories: Zone 3(1) hillside (max 6 m building height, one dwelling per plot, 50% green space minimum) and potentially higher protected zones depending on specific cadastral boundaries. Slopes above 35% gradient require special environmental approval before any clearing or construction. New resort-style multi-unit development is prohibited; existing operations are grandfathered. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones).",
      "Obtaining a building permit for any new structure will require transporting both workers and materials by boat, conducting environmental assessments, and potentially engaging with national park regulations if the land abuts protected forest. This creates a substantially higher regulatory and logistical burden than any other district on the island.",
      { h: "Infrastructure" },
      "There is no public utility grid serviced to individual private parcels. Existing resorts operate on a combination of generator power and basic solar; water is drawn from wells or collected as rainwater. Mobile signal at the beach is poor to absent; 4G is unreliable. Any private property would be fully off-grid by default.",
      { h: "Who suits Bottle Beach" },
      {
        ul: [
          "**Off-grid seclusion seekers** — buyers who explicitly want the most remote possible location on the island and understand the daily access commitment that entails.",
          "**Eco-tourism operators with significant capital** — the 40-rai parcel could, in theory, support a boutique retreat, but requires navigating May 2025 zoning, environmental approvals, and a long development timeline.",
          "**NOT suited to**: families needing daily vehicle access, digital nomads requiring reliable internet, or investors seeking liquidity and capital appreciation benchmarks.",
        ],
      },
      "Bottle Beach is not a conventional property investment. For remoteness with better infrastructure and a clearer market, [Thong Nai Pan](/knowledge/buying-in-thong-nai-pan) on the north-east coast offers premium seclusion with sealed road access. For the northern coast more broadly, see [Buying in Chaloklum](/knowledge/buying-in-chaloklum) — the launch point for Bottle Beach and a more developed alternative.",
    ],
    takeaways: [
      "Access by longtail boat from Chaloklum only (10–15 min, 150–300 THB) or a 1–2 hour jungle trail — no sealed road access to the beach.",
      "Extremely thin property market; the main known listing is a 40-rai parcel at 2 billion THB — no active villa projects or subdivided plots.",
      "May 2025 hillside zoning: one dwelling per plot, 6 m max height, 50% green space, environmental approval required for any slope work.",
      "Fully off-grid: generator power, rainwater/well water, poor mobile signal — any private property carries significant infrastructure overhead.",
      "Suited only to buyers prioritising genuine remote seclusion or niche eco-tourism development; not recommended for standard investment objectives.",
    ],
    sources: [
      {
        title: "The Manduls — Bottle Beach Koh Phangan complete guide",
        url: "https://themanduls.com/bottle-beach-koh-phangan-the-complete-guide-2/",
      },
      {
        title: "Travel Geekery — hiking to Bottle Beach: both routes",
        url: "https://www.travelgeekery.com/hiking-koh-phangan-bottle-beach-hike-both-routes/",
      },
      {
        title: "Islanders Properties — Bottle Beach land listing",
        url: "https://islanders-properties.com/thailand/type-land/for-sale/koh-phangan/bottle-beach/",
      },
      {
        title: "Islanders Properties — Chaloklum and Haad Khom access guide",
        url: "https://islanders-properties.com/blog/chaloklum-koh-phangan-malibu-haad-khom-beaches-sail-rock-diving-access-and-daily-life-193/",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Phangan",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-defenders-need-to-know-may-2025-update/",
      },
      {
        title: "Haad Khuad Resort — official accommodation site",
        url: "https://www.haadkhuadresort.com/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "Can foreigners buy property at Bottle Beach (Haad Khuat) on Koh Phangan?",
  },
  {
    slug: "buying-in-than-sadet",
    kbId: "kb-0043",
    topic: "Phangan",
    title:
      "Buying near Than Sadet, Koh Phangan: national park land, a royal waterfall, and a near-absent market",
    short:
      "Than Sadet, on the island's east coast between Thong Nai Pan and Haad Rin, takes its name from a stream visited repeatedly by King Rama V and later monarchs. More than half the surrounding land sits inside Than Sadet–Koh Phangan National Park, and the handful of titled plots nearby see almost no transaction history — this is land for buyers who want genuine seclusion, not a comparable investment market.",
    updated: "2026-06-30",
    body: [
      "Than Sadet — the name means roughly \"royal visit\" in formal Thai register — refers to a stream and waterfall on Koh Phangan's east coast where King Rama V is recorded visiting repeatedly from 1888 onward, carving his monogram into a streamside rock; later monarchs including Rama VI, VII and IX are also linked to the site. The surrounding area gives its name to **Than Sadet–Koh Phangan National Park**, established by royal decree in November 2018 and covering roughly 26,866 rai (about 43 km²) — more than half the island, including Khao Ra, Koh Phangan's highest peak at 635 m. This is not Mu Koh Ang Thong National Park, a separate marine park near Koh Samui; the two are sometimes confused in casual references.",
      { h: "Where it sits and how you get there" },
      "Than Sadet lies on the east coast, south of Bottle Beach and north of Thong Nai Pan's twin bays, roughly 10–15 km and 25–30 minutes by road from Thong Sala. Sources disagree on the exact surface: some describe the access road as now fully paved, while a local vehicle-rental operator describes it as unpaved and dusty for most of the route with only the final stretch concreted. Either way, a standard scooter manages the route in dry conditions; treat it as more demanding than the main west-coast roads, and expect the dirt sections to be difficult after rain. A boat connection between Thong Nai Pan, Than Sadet and Haad Rin has been reported but without a confirmed regular schedule — do not rely on it as a primary access route.",
      { h: "A market that barely exists" },
      "There is no active villa or subdivision market at Than Sadet. The area's long-running businesses are small and old — bungalow operations open 30-plus years — and no modern resort development has been confirmed. A small number of genuine land listings near the area show Nor Sor 3 Gor titles (not Chanote) in the range of roughly THB 2.5–3.25 million per rai, but the sample is too thin (a handful of plots) to treat as a reliable price benchmark. Claims of Chanote-titled beachfront land directly at Than Sadet are unconfirmed and should be treated with scepticism until a specific title is verified. One documented case elsewhere on the island found a Nor Sor 3 Gor title suspected of having been issued unlawfully over land encroaching on forest reserve — a reminder that title verification matters even more here than in the island's developed districts. See [Land titles on Koh Phangan: Chanote vs Nor Sor 3 Gor](/knowledge/land-titles-chanote-vs-nor-sor-3).",
      { h: "National park boundary and the 2025 zoning rules" },
      "Because Than Sadet–Koh Phangan National Park covers most of the island's interior and a significant share of this coast, the first and most important check on any plot here is whether it sits on genuinely titled private land or encroaches on park or forest-reserve territory. Enforcement has been active: a private airport project near the area was halted in 2015–2017 for encroaching on national park and forest-reserve land, and an October 2025 report documented an island-wide crackdown on illegal construction in protected zones, including foreign-nominee structures. See [Nominee-ownership crackdown: what it means for island buyers](/knowledge/nominee-crackdown-krabi-islands-2026).",
      "Any land that is genuinely titled and outside the park boundary is still subject to the May 2025 environmental zoning regulation covering Koh Samui, Koh Phangan and Koh Tao. Steep, forest-backed terrain of this kind typically falls into the hillside categories — Zone 3(1) above 80 m elevation (one dwelling per parcel, 6 m maximum height, 50% minimum green space) or the stricter Zone 3(2) above 140 m (90 m² maximum footprint, 70% open space) — with slopes over 35% gradient requiring separate environmental approval before any clearing. Structures built before 21 May 2025 are grandfathered. See [Island eco-zoning: where you can and can't build](/knowledge/koh-phangan-building-zones).",
      { h: "Infrastructure" },
      "Documented accounts describe Than Sadet as off-grid: generator power running only in the evening hours at existing bungalow operations, no confirmed mains water connection, and no mobile signal at the beach itself, with at most an intermittent internet connection at one or two properties. Treat any property here as requiring full off-grid self-sufficiency — generator or solar power, well or rainwater collection, and satellite internet — rather than assuming standard utility access.",
      { h: "Who this suits" },
      {
        ul: [
          "**Buyers seeking genuine seclusion** on a titled plot outside the park boundary, who accept generator power, no mains water and unreliable signal as the cost of the location.",
          "**Eco-tourism operators** with patience for environmental approvals and a long development timeline, given the hillside zoning and national park proximity.",
          "**Not suited to**: investors wanting comparable sales data or rental yield benchmarks — none exist here — or any buyer who needs daily vehicle access, reliable internet or mains utilities.",
        ],
      },
      "Than Sadet is best understood as a national park frontier, not a real estate district. Buyers drawn to this stretch of coast but wanting an established market, sealed road and working infrastructure should look first at [Thong Nai Pan](/knowledge/buying-in-thong-nai-pan) just to the north, which offers a comparable sense of remoteness with a functioning villa market and paved access. Anyone seriously considering a plot near Than Sadet should treat the [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan) — and in particular the national park boundary check — as non-negotiable before any deposit changes hands.",
    ],
    takeaways: [
      "Than Sadet is named for a royal stream visited repeatedly by King Rama V from 1888; the surrounding Than Sadet–Koh Phangan National Park (est. 2018) covers over half the island, including the 635 m summit of Khao Ra.",
      "There is no active villa or land market here — only a handful of Nor Sor 3 Gor land listings, too few to establish a reliable price benchmark; treat any Chanote or beachfront title claim with scepticism until independently verified.",
      "Because the national park boundary runs through this area, confirming the title does not encroach on park or forest-reserve land is the single most important check, supported by documented 2025 enforcement action against illegal construction in protected zones.",
      "Titled land outside the park is still subject to May 2025 hillside zoning (Zone 3(1)/3(2)): one dwelling per parcel, 6–9 sqm footprint limits depending on elevation, 50–70% green space, and special approval for slopes over 35%.",
      "Infrastructure is genuinely off-grid: generator-only power in the evenings, no confirmed mains water, and no mobile signal at the beach — buyers should plan for full self-sufficiency, not standard utility access.",
    ],
    sources: [
      {
        title: "Wikipedia — Than Sadet–Ko Pha-ngan National Park",
        url: "https://en.wikipedia.org/wiki/Than_Sadet%E2%80%93Ko_Pha-ngan_National_Park",
      },
      {
        title: "Wikipedia — Mu Ko Ang Thong National Park (for disambiguation)",
        url: "https://en.wikipedia.org/wiki/Mu_Ko_Ang_Thong_National_Park",
      },
      {
        title: "Byklo — Thong Nai Pan / Than Sadet road access notes",
        url: "https://www.byklo.rent/en/city/koh-phangan/thong-nai-pan/",
      },
      {
        title: "Thailand Life — Than Sadet beach and infrastructure notes",
        url: "https://thailandlife.info/than-sadet-in-koh-phangan/",
      },
      {
        title: "Samui Phangan Real Estate — Koh Phangan real estate market overview (national park coverage)",
        url: "https://www.samui-phangan-real-estate.com/koh-phangan-real-estate-market/",
      },
      {
        title: "Sukhothai Inter Law — New Zoning Law for Koh Samui, Koh Phangan & Koh Tao (May 2025)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
      {
        title: "Bangkok Post — officials ground Koh Phangan private airport project",
        url: "https://www.bangkokpost.com/business/general/1258186/officials-ground-koh-phangan-private-airport-project",
      },
      {
        title: "Khaosod English — Koh Phangan faces illegal development crisis in protected areas (October 2025)",
        url: "https://www.khaosodenglish.com/news/2025/10/18/koh-phangan-faces-illegal-development-crisis-in-protected-areas/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "Is it possible to buy land near Than Sadet on Koh Phangan, and what should I check first?",
  },
  {
    slug: "buying-in-haad-yuan-haad-tien",
    kbId: "kb-0044",
    topic: "Phangan",
    title:
      "Buying near Haad Yuan and Haad Tien, Koh Phangan: secluded wellness coves with no road and almost no market",
    short:
      "Haad Yuan and Haad Tien (Haad Thian) are boat-or-trail-only coves on the southeast coast, just north of Haad Rin, known for The Sanctuary wellness retreat and a cluster of yoga-focused bungalow operations. Both run on leased land and self-generated power, with essentially no land or villa resale market — this is a retreat-operator location, not a conventional property investment.",
    updated: "2026-06-30",
    body: [
      "Are Haad Yuan and Haad Tien good places to buy property on Koh Phangan? In short: there is almost nothing to buy. These are two adjoining coves on the southeast coast, just north of Haad Rin, reachable only by longtail boat or a steep jungle trail — and the land beneath their best-known business, The Sanctuary retreat, is leased rather than owned outright by the operator. Treat this area as a retreat-operator or off-grid-lifestyle location, not a place to expect a liquid, comparable property market.",
      { h: "Two coves, and a naming mix-up to avoid" },
      "Haad Yuan and Haad Tien (also spelled Haad Thian) sit on Koh Phangan's southeast coast, separated by a small headland and connected by roughly a 10-minute walk or a short boat hop. Haad Yuan is the more developed of the two, home to backpacker- and yoga-oriented bungalow operations such as Barcelona Resort and Pariya Resort, plus studios near Pure Flow Yoga. Haad Tien hosts **The Sanctuary**, the island's best-known wellness retreat. Note that a separate, unrelated place also called \"Haad Tien\" exists on the island's northwest coast near Haad Yao and Haad Salad — most land listings advertised under that name belong to the northwest beach, not this southeast cove, and should not be confused with it.",
      { h: "Access: boat or a real hike, nothing else" },
      "Neither cove has road access. From Haad Rin, a shared longtail boat to Haad Yuan runs roughly THB 200–500 per person and takes 10–15 minutes, or the cove can be reached on foot via a roughly 3.5 km jungle trail taking about two hours. The Sanctuary's own site describes reaching Haad Tien by shared boat (around THB 500) or by a roughly 40-minute jeep ride on a rough jungle track, with a private speedboat option around THB 7,500 and no night crossings. Boats run on an informal, fill-when-full basis rather than a fixed timetable, and the monsoon season (roughly July–December) regularly disrupts both boat and trail access.",
      { h: "Property market reality" },
      "There is essentially no active resale market at either cove. The only verifiable listing found for the area is a single 20,800 sqm beachfront resort/bungalow property offered around THB 160 million — an institutional-scale, speculative offering, not a benchmark for ordinary land or villa pricing. No price-per-rai data exists for either beach. The Sanctuary itself operates on land leased from a single Thai family, which is part of why the bay has avoided the fragmented ownership seen elsewhere on the island — but it also means there is no comparable freehold or leasehold villa stock changing hands here. A general island guide describes the area as remaining largely undeveloped, with no road services reaching it. Buyers should not treat either cove as a place with a tracked, liquid property market.",
      { h: "Zoning and terrain" },
      "The same May 2025 environmental zoning regulation that applies island-wide governs any future construction here. Given the steep, jungle-backed terrain typical of both coves, hillside categories are the most likely classification — Zone 3(1) above 80 m elevation (one dwelling per parcel, 6 m maximum height, 50% minimum green space) or Zone 3(2) above 140 m (90 m² maximum footprint, 70% open space) — alongside coastal setback and wastewater rules for any near-shore plot. Slopes over 35% require separate environmental approval before grading. Structures built before 21 May 2025 are grandfathered. See [Island eco-zoning: where you can and can't build](/knowledge/koh-phangan-building-zones).",
      { h: "Infrastructure" },
      "Both coves run on self-generated power rather than the PEA grid. The Sanctuary advertises round-the-clock electricity, but this is self-generated rather than mains-supplied; a nearby off-grid operation describes running entirely on solar, battery storage and generator backup. Haad Yuan's smaller bungalow operations commonly run generators only in the evening hours. Internet and mobile signal are reported as unreliable at Haad Yuan, and water supply at both coves appears to be well- or spring-fed rather than mains-connected, though this is thinly documented. Any buyer should assume full off-grid self-sufficiency is required, not standard utility access.",
      { h: "Who this suits" },
      {
        ul: [
          "**Wellness and eco-retreat operators** prepared to lease rather than buy outright, and to self-supply power and water in the style of The Sanctuary or nearby off-grid operations.",
          "**Buyers prioritising genuine seclusion** over convenience, comfortable with boat- or trail-only access and no fallback transport option in poor weather.",
          "**Not suited to**: families needing reliable road access to schools or medical care, remote workers needing dependable internet, or investors seeking comparable sales data or rental-yield benchmarks.",
        ],
      },
      "For the same general stretch of coast with an established market and easier access, [Haad Rin](/knowledge/buying-in-haad-rin) is the practical alternative just to the south, with full road access, ferries and a working rental market. For a similarly remote, beach-driven setting with a paved road and active villa market, see [Thong Nai Pan](/knowledge/buying-in-thong-nai-pan) further up the east coast. Anyone pursuing a deal at either cove should still run the standard [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan), with particular attention to whether any land offered for sale is genuinely titled rather than under an informal lease arrangement.",
    ],
    takeaways: [
      "Haad Yuan and Haad Tien (Haad Thian) are boat- or trail-only coves on the southeast coast just north of Haad Rin — note a separate, unrelated \"Haad Tien\" exists on the northwest coast and should not be confused with this one.",
      "No road access exists at either cove: boats run roughly THB 200–500 and 10–40 minutes depending on the cove and provider, or a 2-hour jungle trail connects Haad Yuan to Haad Rin; both routes are disrupted by the July–December monsoon.",
      "There is essentially no resale market — the only verifiable listing is a single ~THB 160 million institutional-scale beachfront parcel; The Sanctuary itself operates on leased, not owned, land.",
      "Any future construction falls under the May 2025 island-wide environmental zoning, with hillside terrain here likely subject to Zone 3(1)/3(2) limits on height, footprint and green space.",
      "Infrastructure is fully off-grid — self-generated power, well or spring water, and unreliable internet and mobile signal — suited to retreat operators and seclusion-focused buyers, not conventional investors.",
    ],
    sources: [
      {
        title: "The Sanctuary Thailand — how to get to Haad Tien",
        url: "https://www.thesanctuarythailand.com/how-to-get-to-sanctuary/",
      },
      {
        title: "CNN Travel — The Sanctuary, Koh Phangan",
        url: "https://edition.cnn.com/travel/article/thailand-the-sanctuary-koh-phangan",
      },
      {
        title: "The Froggy Adventures — Haad Yuan jungle hike guide",
        url: "https://thefroggyadventures.com/haad-yuan-hike/",
      },
      {
        title: "Thailand Beaches — Haad Yuan guide",
        url: "https://thailandbeaches.org/haad-yuan-phangan/",
      },
      {
        title: "Thailand Beaches — Haad Thian guide",
        url: "https://thailandbeaches.org/haad-thian-phangan/",
      },
      {
        title: "Sukhothai Inter Law — New Zoning Law for Koh Samui, Koh Phangan & Koh Tao (May 2025)",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "Can you buy property at Haad Yuan or Haad Tien on Koh Phangan, and how do you get there?",
  },
  {
    slug: "buying-in-khao-khao-haeng",
    kbId: "kb-0045",
    topic: "Phangan",
    title: "Buying in Khao Khao Haeng: inland hilltop views above Ban Tai",
    short:
      "Khao Khao Haeng is an elevated hill district in the interior of Ban Tai sub-district, known for panoramic island-and-sea views and as the site of Wat Khao Tham, Koh Phangan's long-running Vipassana meditation centre. It suits view-driven buyers and wellness-oriented builders willing to work with slope and a drive to the coast, on land that stays cheaper than beachfront but comes with steeper access and the island's strictest hillside building rules.",
    updated: "2026-07-01",
    body: [
      "Khao Khao Haeng — \"khao\" means hill or mountain — is an elevated interior district within Ban Tai sub-district, on the south-central side of Koh Phangan. The appeal is straightforward: altitude. Plots here climb high enough to open panoramic views across the island's jungle canopy and out to sea, in a cooler, quieter setting than any beach road. The trade-off is equally straightforward — steeper terrain, steeper access, and a drive to reach the nearest coastline.",
      { h: "Location and access" },
      {
        ul: [
          "**Sub-district**: part of Ban Tai, on the south-central interior of the island — not a coastal district.",
          "**Landmark**: home to Wat Khao Tham (also known as the Khao Tham Insight Meditation Center), a Buddhist forest monastery running monthly ten-day Vipassana retreats since 1988 — a well-established fixture that anchors the area's quiet, contemplative reputation.",
          "**Distance to the coast**: a drive is required to reach the nearest beach in Ban Tai or Ban Khai to the south, or Thong Sala to the west; exact minutes vary by plot, since access roads climb the hill from several directions.",
          "**Road quality**: main routes into the hills are paved; the final approach to individual hilltop plots is frequently a steep concrete or dirt track, and grading a driveway on steep ground is a real construction cost to budget for.",
        ],
      },
      { h: "Community and lifestyle" },
      "There is no village centre or beach-town buzz here — the resident population is thin, and the defining institution is the meditation centre rather than any bar or market street. Buyers are not looking for footfall; they are looking for a private hilltop, a view, and quiet. The retreat's decades-long presence has given the area a mild wellness-and-contemplative identity, distinct from Sri Thanu's more commercial yoga-and-cafe scene (see [Buying in Sri Thanu](/knowledge/buying-in-sri-thanu)).",
      { h: "Property market" },
      "Public data specific to Khao Khao Haeng is thin — this is a small, lightly-transacted interior market, not a benchmarked beach strip. As a rough guide, island-wide pricing for hillside land without direct sea frontage tends toward the lower end of the market, roughly 1.5–3 M THB per rai for plots without a confirmed unobstructed view corridor; plots that can prove a genuine panoramic outlook toward Koh Samui or the south coast trade closer to island hillside sea-view benchmarks of 6–10 M THB per rai and above. Because few plots here have a permanently clean view — neighbouring tree growth and future construction can block one — buyers should check whether the outlook is realistically durable before paying a view premium; see the [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan).",
      { h: "Zoning and building rules (May 2025)" },
      "Elevated interior land of this kind falls within the hillside tiers — Zone 3(1) or 3(2) — of the island's May 2025 environmental regulation, generally triggered above roughly 80 m elevation. These are the strictest rules on the island: maximum building height 6 m including roof; one single-family dwelling per parcel; a minimum 50% of the plot kept as green space; natural-coloured roofing; no further subdivision of land. Slopes steeper than 35% require special environmental consent before grading or removing large trees, and new multi-unit resort-style development is barred outright on hillside land. Confirm the exact zone and gradient for any specific plot with a Thai lawyer before committing — see [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones) for the full framework.",
      { h: "Rental outlook" },
      "This is not a short-term-rental location in the conventional sense — there is no beach to market against, and STR demand biases heavily toward coastal walkability. Island-wide, median annual Airbnb revenue runs around 706,000 THB at roughly 68% occupancy (Airbtics, early 2026), but that figure is driven by coastal and near-coastal stock. A hilltop villa here instead competes on privacy, silence, and view — workable for a small wellness retreat or a long-stay rental aimed at guests who specifically want distance from the tourist coast, but not a volume play.",
      { h: "Who suits Khao Khao Haeng" },
      {
        ul: [
          "**View-first buyers** willing to trade beach proximity for altitude and outlook.",
          "**Wellness and retreat-adjacent builders** who benefit from the area's established meditation-centre identity and quiet, and aren't chasing footfall.",
          "**Self-builders comfortable with slope** — expect real earthworks and access-road costs on top of the land price.",
          "**Long-term residents** who want privacy and don't need to walk to a beach or a market.",
        ],
      },
      "Buyers who want the same quiet, inland character on flatter, cheaper, more accessible land should compare [Madeau Wan](/knowledge/buying-in-madeau-wan) or [Ban Nai Suan](/knowledge/buying-in-ban-nai-suan); those who want hillside views with beach access nearby should look at [Mae Haad](/knowledge/buying-in-mae-haad) or [Haad Yao / Haad Salad](/knowledge/buying-in-haad-yao-haad-salad).",
    ],
    takeaways: [
      "Khao Khao Haeng is an elevated interior district in Ban Tai sub-district, best known as the site of Wat Khao Tham, Koh Phangan's long-running Vipassana meditation centre operating since 1988.",
      "The draw is altitude and panoramic views, not beach access — a drive is required to reach any coastline, and the final approach to hilltop plots is often a steep concrete or dirt track.",
      "This is a thin, lightly-documented land market; treat published price ranges (roughly 1.5–3 M THB/rai without a confirmed view, higher for genuine panoramic plots) as indicative and verify the view's durability before paying a premium for it.",
      "As hillside land, most plots fall under the strictest May 2025 zoning tier: 6 m height cap, 50% green space minimum, one dwelling per parcel, no subdivision, and special consent required above 35% slope.",
      "Not a conventional short-term-rental play — the appeal is privacy and quiet for a wellness-adjacent build or a long-term private home, not volume beach tourism.",
    ],
    sources: [
      {
        title: "Trip.com — Wat Khao Tham travel guide (Khao Khao Haeng hill, Ban Tai)",
        url: "https://www.trip.com/travel-guide/koh-phangan/wat-khao-tham-23517294/",
      },
      {
        title: "Khao Tham Insight Meditation Center — official site",
        url: "https://www.kowthamcenter.org/",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Samui, Koh Phangan & Koh Tao",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
      {
        title: "FazWaz — land for sale in Koh Phangan (hillside pricing reference)",
        url: "https://www.fazwaz.com/land-for-sale/thailand/surat-thani/koh-phangan",
      },
      {
        title: "Airbtics — Ko Pha Ngan Airbnb revenue and occupancy data 2026",
        url: "https://airbtics.com/annual-airbnb-revenue-in-ko-pha-ngan-thailand/",
      },
      {
        title: "Islanders Properties — Koh Phangan area guide",
        url: "https://islanders-properties.com/en/blog/koh-phangan-areas-84",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Khao Khao Haeng like and is it worth buying inland hilltop land on Koh Phangan?",
  },
  {
    slug: "buying-in-ban-nai-suan",
    kbId: "kb-0046",
    topic: "Phangan",
    title: "Buying in Ban Nai Suan: central inland land for space and value",
    short:
      "Ban Nai Suan is a quiet inland village near the geographic centre of Koh Phangan, historically orchard and garden land now gradually turning residential. Flat terrain, paved-road and grid-power access, and prices well below coastal benchmarks make it a practical choice for buyers who want more land and a permanent, local base rather than a beachfront address.",
    updated: "2026-07-01",
    body: [
      "Ban Nai Suan (\"the village in the gardens\") sits near the geographic centre of Koh Phangan, on land that was historically coconut and fruit orchards and is now gradually filling in with residential plots. It is not a beach district — the coast is a drive away in every direction — but that central position means reasonably short drives to Thong Sala and to the east, west, and south of the island, which is the area's main practical selling point.",
      { h: "Location and access" },
      {
        ul: [
          "**Position**: central-interior, bordering the similarly quiet [Madeau Wan](/knowledge/buying-in-madeau-wan) district to the west.",
          "**Landmark**: home to the Phangan Elephant Sanctuary, an ethical, no-riding elephant rescue project founded in November 2022 — notable local tourism infrastructure and a sign of the area's still-rural, forest-fringed character.",
          "**Roads**: government-maintained paved roads reach much of the developed part of the district; some listings advertise plots directly fronting a paved government road with three-phase electricity already at the boundary.",
          "**Nearby amenity**: at least one government school sits within the district, relevant for buyers planning a permanent family home rather than a holiday villa.",
        ],
      },
      { h: "Property market" },
      "Land here trades well below coastal benchmarks. Recent listings for flat interior parcels in Ban Nai Suan have ranged from roughly 2 M THB per rai for larger multi-rai tracts to around 3.2–4.5 M THB per rai for smaller, better-serviced plots — for context, comparable proximity to Thong Sala on the west-coast beachfront runs several times higher per rai (see [how land is priced](/knowledge/how-land-is-priced-price-per-rai)). Plot sizes on the market range from single-rai parcels suited to one villa up to 7–8 rai tracts suited to a small development, a working orchard, or a family compound. Treat asking prices as a starting point and confirm actual recent transaction levels with a local agent before committing.",
      { h: "Infrastructure" },
      {
        ul: [
          "**Electricity** — government three-phase supply reaches much of the developed area; confirm the exact distance from any specific boundary before buying raw land.",
          "**Water** — piped water serves more developed pockets; for orchard-zone raw land, a private well or borehole remains the standard fallback, as in neighbouring Madeau Wan.",
          "**Roads** — paved government roads connect the district to the rest of the island; some plots sit directly on sealed-road frontage, a genuine advantage over hillside or deep-interior land.",
          "**Mobile/internet** — standard 4G coverage across the area (AIS/DTAC/True); fibre reaches the more developed pockets.",
        ],
      },
      { h: "Zoning and building rules" },
      "Ban Nai Suan's flat, low-elevation terrain places most of the district outside the two strictest tiers of the island's May 2025 environmental regulation: the coastal Zone 2 setback and green-space rules don't apply inland, and the hillside Zone 3 rules (6 m height cap, no subdivision) generally trigger only above roughly 80 m elevation, which excludes most of this district's flatter land. That makes Ban Nai Suan among the less-restricted areas for ordinary residential building on the island — though any specific plot's zone and elevation should still be verified with a Thai property lawyer before purchase, since the district does rise gently toward its edges. See [Island eco-zoning 2025](/knowledge/koh-phangan-building-zones) for the full map.",
      { h: "Who buys here" },
      {
        ul: [
          "**Families and long-term residents** who want a permanent home, more land per baht, and proximity to a local school rather than beach access.",
          "**Value-oriented self-builders** who accept a drive to the coast in exchange for land priced a fraction of west-coast beachfront.",
          "**Orchard and small-agriculture buyers** — much of the land retains its garden/orchard character and suits owners who want to keep it productive.",
          "**Buyers drawn to the area's quieter, rural, forest-fringed identity**, reinforced by the elephant sanctuary nearby.",
        ],
      },
      "As with any interior plot, confirm road access, the nearest grid-power connection point, and the water source before paying for land here — see the [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan). Foreign buyers use the standard [30-year lease structure](/knowledge/how-foreigners-own-a-villa) as everywhere on the island; the 2025 crackdown on nominee Thai-company ownership applies here as much as anywhere (see [A Thai company for property](/knowledge/thai-company-for-property-49-51)).",
    ],
    takeaways: [
      "Ban Nai Suan is a quiet, historically orchard-and-garden village near the geographic centre of Koh Phangan — a drive from any coast but centrally placed relative to the rest of the island.",
      "It is home to the Phangan Elephant Sanctuary, an ethical elephant rescue project founded in 2022, and to at least one local government school.",
      "Recent listings for flat interior land here have ranged roughly 2–4.5 M THB per rai, well below comparable-proximity west-coast beachfront pricing.",
      "Flat, low-elevation terrain keeps most of the district outside the strictest hillside and coastal tiers of the May 2025 zoning regulation, though any specific plot should still be checked.",
      "Buyers here are mostly families, long-term residents, and value-focused self-builders — not short-term-rental or beach-lifestyle buyers.",
    ],
    sources: [
      {
        title: "KPN Properties — Baan Nai Suan area listings",
        url: "https://kpnproperties.com/area/baan-nai-suan/",
      },
      {
        title: "Lazudi — 7-rai flat land in Baan Nai Suan, Koh Phangan",
        url: "https://lazudi.com/th-en/surat-thani/property/7-rai-flat-land-in-baan-nai-suan-koh-phangan-193003",
      },
      {
        title: "Fairfax Real Estate — Baan Nai Suan land, Koh Phangan, 8 rai",
        url: "https://fairfax-realestate.biz/property/baan-nai-suan-land-koh-phangan-8-rai/",
      },
      {
        title: "Nestopa — land for sale, central Koh Phangan (Maduwan / Ban Nai Suan)",
        url: "https://nestopa.com/th-en/property/surat-thani-ko-pha-ngan-ko-pha-ngan/land-for-sale-central-koh-phangan-maduwan-ban-nai-suan-547773",
      },
      {
        title: "Phangan Elephant Sanctuary — official site",
        url: "https://phanganelephantsanctuary.org/",
      },
      {
        title: "Sukhothai Interlaw — May 2025 zoning law for Koh Samui, Koh Phangan & Koh Tao",
        url: "https://re.sukhothaiinterlaw.com/new-zoning-law-for-koh-samui-koh-phangan-koh-tao-what-property-owners-developers-need-to-know-may-2025-update/",
      },
      {
        title: "Islanders Properties — Koh Phangan area guide",
        url: "https://islanders-properties.com/en/blog/koh-phangan-areas-84",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion:
      "What is Ban Nai Suan like and who should consider buying land there on Koh Phangan?",
  },
  {
    slug: "thailand-99-year-leasehold-bill-status",
    kbId: "kb-0047",
    topic: "Structures",
    title: "Thailand's 99-year leasehold bill: why it was shelved and what the law allows in 2026",
    short:
      "The headline plan to let foreigners lease Thai land for up to 99 years was shelved by the government in September 2025 and has no active path through parliament. The statutory ceiling remains 30 years under Section 540 — reinforced, not loosened, by the March 2025 Supreme Court ruling on stacked leases.",
    updated: "2026-07-02",
    body: [
      "Is Thailand about to let foreigners lease land for 99 years? No. The government shelved the proposal in September 2025, and no bill is currently before parliament. Every villa purchase on Koh Phangan today should still be structured, priced and negotiated around the existing 30-year statutory lease term — not a longer term that does not yet exist in law.",
      { h: "What the bill would have done" },
      "The draft Rights over Leasehold Asset Act would have let a lessee hold long-term use rights over non-agricultural land for up to 99 years, with the asset registered through a Treasury Department structure rather than sold outright to the foreign lessee — the land itself would still revert to the state at the end of the term. During the term, a lessee would have been able to mortgage, transfer or pass the lease to heirs. The stated goals were to attract long-term foreign investment and skilled workers against a backdrop of demographic decline, and to give buyers a genuine legal alternative to nominee structures.",
      { h: "Why it stalled" },
      "The bill was a flagship Pheu Thai policy, but it needed the Interior Ministry's cooperation — a portfolio then held by the Bhumjaithai Party — and sat stalled for over a year. It was briefly revived and fast-tracked in mid-2025 when Pheu Thai took over the Interior Ministry, with officials aiming for parliamentary passage by the end of the year. The political landscape then shifted again: on 16 September 2025, Bhumjaithai deputy leader Siripong Angkhasakulkiat announced the plan would not be pursued, stating that \"this government has a limited mandate, and we will not push legislation still under study, as there is insufficient time,\" and noting the proposal had \"sparked debate among MPs and society.\"",
      { h: "What's actually in force today" },
      {
        ul: [
          "**30-year statutory ceiling** — Civil and Commercial Code Section 540 caps a registrable lease of immovable property at 30 years; nothing about this has changed.",
          "**Stacked \"30+30+30\" leases are void beyond the first term** — the March 2025 Supreme Court ruling (Case No. 4655/2566) confirmed that pre-agreed, simultaneously signed renewals don't survive past year 30. See [Renewing a 30-year lease](/knowledge/renewing-30-year-lease-risks).",
          "**Building ownership via superficies** — a foreigner can still own the villa structure outright and register a superficies independent of the lease term. See [Superficies, usufruct and lease](/knowledge/superficies-vs-usufruct-vs-lease).",
          "**BOI-promoted land ownership** — a narrow, business-linked route remains available for specific promoted investments, not for a personal residence.",
        ],
      },
      { h: "What replaced it on the policy agenda" },
      "Rather than extending lease terms, the current government's stimulus lever for the struggling property sector is a proposed 50% cut to land and building tax for 2026, under review as of mid-2026. Some officials have floated a scaled-back 60-year alternative paired with a fee-and-tax fund for foreign lessees, but nothing of that kind has reached bill form.",
      "The practical takeaway: if a leasehold bill is revived, it would still need public consultation, Cabinet approval, and passage through the House and Senate before Royal Assent — a process of months at minimum, not something that changes overnight. Until then, treat any listing or agent pitch promising a 99-year lease as, at best, premature and at worst a red flag. Structure your purchase around the 30-year lease and superficies combination described in [How foreigners legally own a villa](/knowledge/how-foreigners-own-a-villa).",
    ],
    takeaways: [
      "The 99-year leasehold bill (Rights over Leasehold Asset Act) was shelved by the government on 16 September 2025, citing a limited mandate and public controversy — it is not law and has no active parliamentary path.",
      "Thailand's statutory lease ceiling remains 30 years under Civil and Commercial Code Section 540.",
      "The March 2025 Supreme Court ruling already closed the main workaround — simultaneously signed \"30+30+30\" stacked leases are void beyond the first 30-year term.",
      "If a leasehold bill is revived, it would still require public consultation, Cabinet approval, and passage through the House and Senate before taking effect — expect months, not weeks.",
      "The government's current property-sector stimulus focus is a proposed land-and-building tax cut, not extended lease terms — treat any \"99-year lease available now\" pitch as premature.",
    ],
    sources: [
      {
        title: "Nation Thailand — New government considers 50% land tax cut, shelves 99-year leasehold plan",
        url: "https://www.nationthailand.com/news/policy/40055500",
      },
      {
        title: "Nation Thailand — Pheu Thai revives 99-year leasehold law as Interior Ministry shift nears",
        url: "https://www.nationthailand.com/blogs/news/policy/40051898",
      },
      {
        title: "Nation Thailand — Thai Government Pushes for 99-Year Land Leases to Attract Investment",
        url: "https://www.nationthailand.com/business/property/40052803",
      },
      {
        title: "Civil and Commercial Code Section 540; Supreme Court Case No. 4655/2566 (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "Is Thailand introducing a 99-year lease for foreigners?",
  },
  {
    slug: "land-office-source-of-funds-checks-2026",
    kbId: "kb-0048",
    topic: "Process",
    title: "The Land Office's May 2026 source-of-funds checks: what changed at registration",
    short:
      "Between 15 and 25 May 2026 the Department of Lands issued three 'Most Urgent' circulars standardising nominee-detection checks at every Provincial Land Office. For a compliant lease-and-superficies buyer, the underlying law hasn't changed — but expect more paperwork proving where your money came from.",
    updated: "2026-07-02",
    body: [
      "Will the Land Office ask more questions about my money in 2026? Yes. Between 15 and 25 May 2026, the Department of Lands (DOL) issued three consecutive \"Most Urgent\" circulars to every Provincial Land Office, consolidating years of scattered nominee-enforcement guidance into one standardised checklist. The underlying law hasn't changed — Section 74 of the Land Code has always let officials question a purchase — but the circulars make that questioning routine rather than occasional, especially for cash deals and Thai-majority companies.",
      { h: "What the circulars actually do" },
      "These are not new legislation. They consolidate existing Land Code and Foreign Business Act enforcement powers into a unified national framework, and instruct every Land Office to build and maintain a running database of every juristic person holding land in its jurisdiction — registration details, parcels, acquisition dates, appraised values, stated business purpose — screened for nominee risk on a recurring basis.",
      { h: "The triggers at registration" },
      {
        ul: [
          "**Cash payments of ฿2 million or more, or an appraised value above ฿5 million** — trigger a mandatory source-of-funds investigation under Section 74 (transfers to statutory heirs by inheritance are excluded).",
          "**Thai-shareholder companies where shareholders appear to lack the financial capacity** to fund their stated shareholding.",
          "**Shareholding restructured to satisfy Land Code Sections 97–98 on paper while foreign control stays intact.**",
          "**Thai shareholding increased after the land was acquired** — read as a possible after-the-fact attempt to cover a nominee arrangement.",
          "**Thai spouses of a foreign buyer** may be asked to confirm in writing that purchase funds are their own separate property, not funnelled from their foreign spouse.",
        ],
      },
      { h: "What Section 74 lets an official do" },
      "Section 74 empowers a land official to interrogate the parties involved, summon anyone concerned to give oral testimony or written evidence, and — if evasion is suspected — refer the case up to the Minister of Interior, whose decision is final. This power has existed for decades; the 2026 circulars make it standard practice at registration rather than a rarely invoked one.",
      { h: "What this means in practice for a compliant purchase" },
      "For a straightforward individual lease-and-superficies purchase funded through a properly remitted transfer, the substance of the process is unchanged — but expect the Land Office to ask for documentary proof of fund origin more consistently, particularly on cash payments above the ฿2 million threshold. Keep your inbound transfer paperwork organised and available at registration; see [Bringing money into Thailand: the FET form](/knowledge/bringing-money-into-thailand-fet-form).",
      "For anyone buying through a Thai-majority company, scrutiny is materially heavier — see [A Thai company for property (49/51)](/knowledge/thai-company-for-property-49-51) and [Nominee crackdown spreads to Krabi](/knowledge/nominee-crackdown-krabi-islands-2026) for the criminal and forced-sale exposure if a Land Office flags the structure.",
      { h: "Bottom line" },
      "The circulars raise the friction of registration day, not the underlying legal bar. A buyer using the standard lease-plus-superficies structure, with funds remitted and documented properly, should move through the process largely unaffected in substance. A buyer relying on an undocumented cash payment or a Thai-majority company with passive nominee shareholders faces materially higher detection risk in 2026 than in prior years.",
    ],
    takeaways: [
      "Between 15 and 25 May 2026 the Department of Lands issued three \"Most Urgent\" circulars, standardising nominee-detection checks across every Provincial Land Office nationwide.",
      "Cash payments of ฿2 million+ or an appraised value above ฿5 million now trigger a mandatory source-of-funds investigation under Land Code Section 74 (statutory-heir inheritance excluded).",
      "Land Offices must build and screen a running database of every landholding juristic person for nominee risk on a recurring basis.",
      "A Thai spouse of a foreign buyer may be asked to confirm in writing that purchase funds are their own separate property.",
      "The circulars don't change the underlying law — they standardise enforcement — so a documented lease-and-superficies purchase with properly remitted funds is affected in paperwork, not in substance.",
    ],
    sources: [
      {
        title:
          "Silk Legal — What Thailand's New Lands Directives Mean for Nominee Shareholding and Property Ownership in 2026",
        url: "https://silklegal.com/what-thailands-new-lands-directives-mean-for-nominee-shareholding-and-property-ownership-in-2026/",
      },
      {
        title: "Nation Thailand — Land Department steps up crackdown on nominee landholding",
        url: "https://www.nationthailand.com/news/general/40066115",
      },
      {
        title: "Thailand Land Code, Section 74 (general practice)",
      },
    ],
    faqHref: "/faq",
    faqCategory: "process",
    faqQuestion: "What extra checks will the Land Office run on my purchase in 2026?",
  },
  {
    slug: "illegal-construction-forest-reserve-crackdown-koh-phangan",
    kbId: "kb-0049",
    topic: "Phangan",
    title: "Illegal construction crackdown in Koh Phangan's forest reserves and hillsides: what a buyer needs to know",
    short:
      "In September 2025, Surat Thani authorities found at least five buildings standing inside Koh Phangan's national forest reserve, plus cleared hillside land prepared for more. GPS-mapped enforcement and a parallel nominee-ownership crackdown mean a title deed alone no longer proves a plot is clean — boundary verification against the forest reserve is now essential due diligence.",
    updated: "2026-07-04",
    body: [
      "Is it actually illegal to build inside Koh Phangan's forest reserve or on a graded hillside without checking the boundary first? Yes — and in September 2025 Surat Thani authorities found out how common it had become. Inspectors discovered at least five buildings already standing inside the island's national forest reserve, plus cleared and graded hillside land with groundwater wells drilled ahead of further construction. The case is now one strand of a wider 2025–2026 enforcement campaign that should change how any buyer checks a plot before committing.",
      { h: "What was found" },
      {
        ul: [
          "**At least five buildings** confirmed built inside Koh Phangan's national forest reserve during September 2025 inspections.",
          "**Adjacent hillside land cleared and graded** for vehicle access, with wells drilled — signalling further construction was planned before the enforcement action.",
          "**A dedicated task force** under the Fourth Army Region carried out the investigation, at the direction of the Surat Thani governor, who ordered agencies to accelerate the review with a focus on foreign nationals and nominee operations.",
        ],
      },
      { h: "How investigators are documenting the violations" },
      "Inspectors are using aerial photography and GPS mapping to record the exact footprint of cleared and built areas, cross-referencing the results against the surveyed forest-reserve boundary before submitting findings to the Surat Thani governor for legal action. This is a materially more rigorous method than a single site visit — it produces a defensible geographic record that can support prosecution and demolition orders.",
      { h: "The legal exposure" },
      "Building on or holding land inside a reserved forest without a specific statutory right is a criminal offence under the National Reserved Forest Act B.E. 2507 (1964). Enforcement precedent elsewhere in Thailand shows this exposure is real even where a title deed exists: in a widely cited Phuket case, the Supreme Administrative Court ordered a hotel demolished after finding the underlying land certificate had been unlawfully issued over forest land. Since 2020, Thailand's national parks authority has demolished or ordered the demolition of more than 20 luxury villas, resorts and hotels found illegally built inside national parks in the Western Forest Complex alone — a title document did not protect any of them.",
      { h: "Part of a wider enforcement wave" },
      "The forest-reserve findings sit alongside a broader nominee-ownership crackdown running across Koh Phangan and Koh Samui through late 2025 and into 2026: a first round of raids targeted 32 companies with apparent nominee structures across 45 land plots (more than 40 rai), with damage assessed above ฿200 million and 22 foreign arrests; a second phase involved more than 300 officers. See [Nominee-ownership crackdown: what it means for island buyers](/knowledge/nominee-crackdown-krabi-islands-2026). The pattern in both strands is the same: authorities are now cross-referencing land registry, corporate and geographic data rather than relying on paperwork presented at the counter.",
      { h: "What this means before you buy" },
      {
        ul: [
          "**A title deed is not proof a plot sits outside the forest reserve.** Elsewhere on the island, a Nor Sor 3 Gor title has been found issued over land suspected of encroaching on forest-reserve boundaries — see [Chanote vs Nor Sor 3 Gor in practice](/knowledge/land-titles-chanote-vs-nor-sor-3).",
          "**Check the plot against the Royal Forest Department's reserve boundary**, not just the cadastral map, before signing anything — a Thai lawyer or licensed surveyor can request an overlay.",
          "**Treat 'already cleared' or 'already has a well' as a red flag, not a selling point**, on hillside or forest-adjacent land — that is precisely the pattern investigators are now targeting.",
          "**Any structure already built without this check carries real demolition risk**, regardless of how long it has stood or what a seller claims about its permit status.",
        ],
      },
      "None of this changes how a compliant purchase works — a verified title, a confirmed zone, and a properly registered lease and superficies remain the standard, safe route; see [Building a villa on Koh Phangan](/knowledge/building-a-villa-koh-phangan) and the [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan). It does mean that boundary verification against the forest reserve is no longer an optional extra for hillside or interior land — it is now an active enforcement risk.",
    ],
    takeaways: [
      "In September 2025 inspections, Surat Thani authorities found at least five buildings constructed inside Koh Phangan's national forest reserve, plus cleared and graded hillside land with wells drilled for further construction.",
      "Investigators used aerial photography and GPS mapping to cross-reference cleared and built areas against the forest-reserve boundary before referring findings to the Surat Thani governor for legal action.",
      "Under the National Reserved Forest Act B.E. 2507 (1964), building or holding land inside reserved forest without a specific right is a criminal offence that has led to eviction and demolition orders elsewhere in Thailand — even where a land title existed.",
      "The forest-reserve crackdown runs alongside a wider 2025–2026 nominee-ownership enforcement campaign on Koh Phangan and Koh Samui — hundreds of officers involved, dozens of companies investigated, over ฿200 million in assessed damage.",
      "A title deed is not proof a plot lies outside the forest reserve — some titles elsewhere on the island have been found issued over encroached land — so boundary verification against Royal Forest Department maps is an essential, separate due-diligence step.",
    ],
    sources: [
      {
        title: "Khaosod English — Koh Phangan Faces Illegal Development Crisis in Protected Areas",
        url: "https://www.khaosodenglish.com/news/2025/10/18/koh-phangan-faces-illegal-development-crisis-in-protected-areas/",
      },
      {
        title:
          "Thai Examiner — Koh Phangan crackdown continues as Thai officials send a message: illegal investors are not wanted",
        url: "https://www.thaiexaminer.com/thai-news-foreigners/2025/11/25/koh-phangan-crackdown-continues-as-thai-government-sends-message-small-time-investors-are-not-wanted/",
      },
      {
        title: "Mongabay — Thai authorities demolish resorts in parks, but struggle to prosecute encroachers",
        url: "https://news.mongabay.com/2022/03/thai-authorities-demolish-resorts-in-parks-but-struggle-to-prosecute-encroachers/",
      },
      {
        title: "National Reserved Forest Act B.E. 2507 (1964), FAOLEX translation",
        url: "https://faolex.fao.org/docs/pdf/tha53402.pdf",
      },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Is illegal construction in Koh Phangan's forest reserves and hillsides being enforced, and what does that mean for buyers?",
  },
  {
    slug: "forged-building-permits-koh-phangan-verify",
    kbId: "kb-0050",
    topic: "Phangan",
    title: "Forged building permits on Koh Phangan: how to verify a permit is genuine",
    short:
      "On 25 March 2026, Surat Thani authorities confirmed 40 forged building permits tied to the Koh Phangan district, including at least nine completed luxury villas owned by foreign buyers. A parallel scandal on Koh Samui shows the same fraud pattern — which means a permit document alone is no longer proof of anything without checking it against the issuing office's own records.",
    updated: "2026-07-04",
    body: [
      "Can a Koh Phangan building permit turn out to be fake even after your villa is fully built? Yes — on 25 March 2026, Surat Thani authorities confirmed 40 forged building permits tied to properties in the Koh Phangan district, including at least nine completed luxury villas owned by foreign buyers. The case shows why a permit document by itself is not proof of anything; it has to be verified against the issuing office's own records.",
      { h: "What happened" },
      {
        ul: [
          "**8 January 2026** — a design-and-construction company owner filed a complaint against an employee of the Phet Phangan local public works office, alleging fabricated permits.",
          "**25 March 2026** — authorities confirmed 40 forged building permits across the Koh Phangan district, affecting at least nine fully built luxury villas belonging to foreign owners.",
          "**Consequence for owners** — because the underlying permit is fraudulent, the affected villas cannot be issued a house number (Tabien Baan) or proceed through standard property registration until the case is resolved.",
          "**Method** — forensic examiners are investigating whether the signatures on the fake documents were applied digitally rather than by the named officials, pointing to a systematic rather than one-off scheme.",
        ],
      },
      { h: "Not an isolated case" },
      "A parallel scandal surfaced on neighbouring Koh Samui days earlier, on 21 March 2026, when a municipal legal officer publicly urged property owners to verify their permits. That investigation — triggered by a municipal complaint filed 20 January 2026 alleging signature forgery — found close to 10 forged permits in its first pass, on top of more than 100 questionable permits already flagged during 2024–2025 'Samui Model' compliance inspections. The alleged method was a lower-level public works employee producing fraudulent approvals in exchange for bribes reported at roughly ฿100,000 per permit. Officials in both cases say they are pursuing whether more senior staff were involved.",
      { h: "The exposure for a villa owner" },
      "A forged permit is not a paperwork inconvenience — it is the difference between a legally built structure and one Thai authorities can treat as unauthorised construction. Reported consequences for owners caught in either scandal include the inability to register a house number, transfer, or sell the property, and exposure to a demolition order if the underlying build is found not to conform to what a genuine permit would have required. See [Building a villa on Koh Phangan: permits, zones, timelines](/knowledge/building-a-villa-koh-phangan) for what a legitimate permit process actually involves.",
      { h: "How to verify a permit before you rely on it" },
      {
        ul: [
          "**Confirm the permit with the issuing office directly** — a Por 1 (Or Bor 1) construction permit is issued by the local Tambon Administrative Organisation (OrBorTor) or municipality; ask the office to confirm the permit number against its own registry rather than accepting the paper copy at face value.",
          "**Verify the architect's and engineer's licences independently** — check registration status on the Council of Architects of Thailand (act.or.th) and the Council of Engineers, since a genuine-looking set of stamped plans still depends on a real, currently licensed signatory.",
          "**Have a Thai lawyer cross-check the build against the permit**, not just confirm that a permit exists — the constructed footprint, height and use must match what was actually approved.",
          "**Treat a villa without a completed house-number registration as unresolved**, not as a minor formality still in progress — that gap is exactly what both scandals exposed.",
        ],
      },
      "This risk sits alongside, not instead of, the usual checks on title, zoning and lease structure — see the [due diligence checklist](/knowledge/due-diligence-checklist-koh-phangan) and [Island eco-zoning: where you can and can't build](/knowledge/koh-phangan-building-zones). A genuine permit confirmed at source is now as essential a check as the title deed itself.",
    ],
    takeaways: [
      "On 25 March 2026, Surat Thani authorities confirmed 40 forged building permits in the Koh Phangan district, tied to at least nine completed luxury villas owned by foreign buyers.",
      "The fraud was allegedly run by a public works department employee (hired in 2022) producing fake permits for roughly ฿100,000 each; a parallel scheme on Koh Samui surfaced over 100 questionable permits during 2024–2025 inspections.",
      "Affected owners cannot obtain a house number (Tabien Baan) or complete standard property registration on their fully built villas until the fraud is resolved.",
      "A permit document alone proves nothing — verify a Por 1 (Or Bor 1) directly with the issuing local administration's registry, not just by inspecting the paper.",
      "Independently confirm the architect's and engineer's licences via the Council of Architects of Thailand (act.or.th) and the Council of Engineers before relying on a permit tied to a specific build.",
    ],
    sources: [
      {
        title: "ZoneSamui — Property Mafia: 40 New Forged Building Permits Discovered on Koh Phangan Island",
        url: "https://en.zonesamui.com/34136-property-mafia-40-new-forged-building-permits-discovered-on-koh-phangan-island",
      },
      {
        title: "Thailand News — Scandal Involving Fake Building Permits Uncovered on Koh Samui",
        url: "https://www.thailandnews.co/2026/03/scandal-involving-fake-building-permits-uncovered-on-koh-samui/",
      },
      {
        title: "Council of Architects of Thailand — architect licence verification",
        url: "https://www.act.or.th/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "documents",
    faqQuestion: "How do I check that a villa's building permit on Koh Phangan is genuine and not forged?",
  },
  {
    slug: "land-department-audit-existing-landholding-companies-2026",
    kbId: "kb-0051",
    topic: "Structures",
    title: "The Land Department's 2026 audit of existing landholding companies: what owners must have ready",
    short:
      "Since 2025-2026, Thailand's Department of Business Development and Department of Lands have run an AI-driven audit (IBAS) of company registry and land records nationwide, feeding a running database that every Provincial Land Office must now review monthly. A company already holding land isn't exempt — if it's flagged as a nominee structure, Land Code Section 96 gives officials the power to force a sale within 180 days to a year.",
    updated: "2026-07-08",
    body: [
      "Can a Thai company that already owns land be investigated years after it registered? Yes — and through 2025 and 2026, that has become the routine case rather than the exception. The audit isn't limited to new purchases at the counter; it's an ongoing, AI-assisted review of companies that already hold title, running quietly in the background until a flag surfaces.",
      { h: "What changed: from spot checks to a standing database" },
      {
        ul: [
          "**IBAS (Intelligence Business Analytic System)** — an AI tool the Department of Business Development (DBD) has run since October 2025, cross-referencing corporate registry data against the Revenue Department, Customs, the Anti-Money Laundering Office and Land Department records to flag shareholding, capital and directorship patterns typical of nominee arrangements.",
          "**A formal data-sharing agreement between the DBD and the Department of Lands**, plus an MOU with the Central Investigation Bureau, means a flag raised in one agency can trigger a parallel investigation in another — a company doesn't need a new transaction to come under review.",
          "**Three 'Most Urgent' circulars issued 15–25 May 2026** instructed every Provincial Land Office to build and maintain a database of every company holding land in its jurisdiction — registration details, parcels, acquisition dates, appraised values, stated business purpose. See [The Land Office's May 2026 source-of-funds checks](/knowledge/land-office-source-of-funds-checks-2026) for the registration-side rules that came out of the same circulars.",
          "**Land Offices must review this database monthly and report to the Department of Lands quarterly**, with immediate reporting required for any company that meets the foreign-shareholding thresholds in Sections 97–98 of the Land Code.",
        ],
      },
      { h: "The legal mechanism if a company is flagged: Section 96" },
      "Section 96 of the Land Code applies the disposal procedure in Section 94 \"mutatis mutandis\" to nominee cases — when it appears a Thai person or entity holds land as the registered owner in place of a foreign national or foreign-controlled juristic person, the Director-General of the Department of Lands has the authority to order disposal. The holder must sell the land within a period the Director-General sets, which by law can be no less than 180 days and no more than one year. If the land isn't sold within that window, the Director-General gains the power to arrange the sale directly — in practice, a forced disposal rather than a voluntary one. A separate proposal to amend the Land Code so unlawfully held land is forfeited to the state without compensation, instead of sold with proceeds returned to the holder, is under study but is not current law.",
      { h: "The scale so far" },
      "Enforcement tied to this framework is not marginal: reporting through 2025 and into 2026 has tracked several hundred companies prosecuted and well over ฿15 billion in economic damage identified nationwide, spanning Bangkok, the Eastern Economic Corridor and the southern islands. See [Nominee-ownership enforcement spreads to Krabi](/knowledge/nominee-crackdown-krabi-islands-2026) for how the same campaign has moved across provinces.",
      { h: "What an existing company-structure owner should have ready" },
      {
        ul: [
          "**Documented source of funds for every Thai shareholder** — bank records or income evidence showing the shareholder could genuinely afford their stated shareholding, not just a signed share register.",
          "**Evidence of real control matching the paper structure** — if a Thai shareholder holds 51%, they should be able to show they exercise the voting and economic rights that percentage implies, not just hold a signed proxy or side letter.",
          "**A credible business rationale for the company itself** — a land-holding company with no other activity, no other shareholders, and a single foreign director is exactly the profile IBAS is tuned to flag.",
          "**Underlying agreements reviewed for de facto control clauses** — loan agreements, usufruct-style side contracts or voting proxies that hand economic or decision-making control to the foreign party undermine the structure even if the shareholding register looks correct.",
          "**A relationship with a Thai lawyer who can respond to a Land Office inquiry quickly** — once a company is flagged, the response window is short, and the disposal clock under Section 96 does not pause for a slow answer.",
        ],
      },
      "None of this is new law — the 49/51 company structure was always required to reflect genuine Thai control, not just genuine Thai names on paper; see [A Thai company for property: when it makes sense, when it's toxic](/knowledge/thai-company-for-property-49-51). What's changed is enforcement capacity: a structure that would once have sat unreviewed for years now sits inside a database that's checked every month.",
    ],
    takeaways: [
      "IBAS, an AI system the DBD has run since October 2025, cross-references corporate and land records nationwide to flag nominee-pattern shareholdings — including in companies that already hold title, not just new purchases.",
      "Between 15 and 25 May 2026, the Department of Lands ordered every Provincial Land Office to build a database of land-holding companies, reviewed monthly with quarterly reporting to the department.",
      "Land Code Section 96 applies Section 94's disposal procedure to nominee cases: the Director-General can order a sale within 180 days to one year; if the holder misses that window, the Director-General can arrange the sale directly.",
      "A proposal to allow forfeiture to the state without compensation, instead of a forced sale with proceeds returned, is under study but is not yet law.",
      "Enforcement under this framework has already reached several hundred prosecuted companies and over ฿15 billion in identified damages nationwide — existing structures should have source-of-funds and control documentation ready, not just a compliant-looking share register.",
    ],
    sources: [
      {
        title: "Thailand.go.th — Thailand Launches IBAS: A Digital Weapon Against Nominee Companies",
        url: "https://www.thailand.go.th/guide-book-detail/-ibas---",
      },
      {
        title: "Silk Legal — What Thailand's New Lands Directives Mean for Nominee Shareholding and Property Ownership in 2026",
        url: "https://silklegal.com/what-thailands-new-lands-directives-mean-for-nominee-shareholding-and-property-ownership-in-2026/",
      },
      {
        title: "ThailandLawOnline — Thai Land Law: full translation of the Land Code Act (Sections 94, 96)",
        url: "https://www.thailandlawonline.com/thai-real-estate-law/thai-land-law-land-code-act",
      },
      {
        title: "AIM Bangkok — Thailand Cracks Down on Nominee Land Structures: Land Code 'Forfeiture to the State' Proposal Under Study",
        url: "https://aimbangkok.com/thailand-foreign-nominee-land-ownership-confiscation-risk/",
      },
    ],
    faqHref: "/faq",
    faqCategory: "structures",
    faqQuestion: "My company already owns land in Thailand — can it still be audited as a nominee structure, and what happens if it's flagged?",
  },
  {
    slug: "vacant-land-tax-step-up-agricultural-loophole-2026",
    kbId: "kb-0052",
    topic: "Costs",
    title: "Vacant-land tax step-up in 2026 and the agricultural-use loophole crackdown",
    short:
      "2026 (B.E. 2569) is the first year Thailand's Land and Building Tax adds its automatic step-up penalty — an extra 0.3% on top of the standard rate for land left idle three years running. At the same time, regulators have tightened the planting-density rules that let owners reclassify vacant land as 'agricultural' to dodge that rate altogether, so a few token banana trees no longer guarantee the lower bracket.",
    updated: "2026-07-08",
    body: [
      "Why did a vacant plot's land tax bill jump in 2026? For any land left unused for three consecutive years, the Land and Building Tax Act now adds an automatic step-up — an extra 0.3% on top of the standard vacant-land rate, repeating every three years up to a 3% ceiling. 2026 (B.E. 2569) is the first year plots that sat idle since the tax regime's effective start are hitting that three-year mark, and it lands at the same time as a separate tightening of the rules landowners have long used to dodge the vacant-land bracket entirely by planting crops.",
      { h: "The step-up, in numbers" },
      {
        ul: [
          "**Standard vacant/unused land rate** runs from 0.3% (up to ฿50 million appraised value) to 0.7% (over ฿5 billion), scaled by value band.",
          "**After three consecutive years unused**, an extra 0.3% is added on top of the standard rate for that value band.",
          "**The step repeats every three years the land stays idle**, up to a 3% cap — so a plot can climb well past its starting rate if it's never developed or put to productive use.",
          "**Worked example**: a ฿100 million vacant plot paying 0.4% (฿400,000/year) through the first three-year window jumps to 0.7% (฿700,000/year) once the step-up applies — with no change in the land itself, only in how long it's sat idle.",
        ],
      },
      { h: "The agricultural escape route — and why it's narrower now" },
      "Agricultural land is taxed far more lightly than vacant land — individual owners get the first ฿50 million of value exempt, then pay as little as 0.01%, rising gradually; companies pay somewhat more but still far below the vacant-land bands. That gap has long pushed landowners, particularly on prime urban plots, to plant crops purely to reclassify vacant land as 'agricultural' — banana, lime, mango and similar fast, cheap plantings became so associated with the practice that it's commonly known in Thailand as the 'banana tree loophole'.",
      { h: "What regulators tightened" },
      {
        ul: [
          "**A minimum planting density applies, crop by crop** — the original Finance Ministry schedule required at least 200 banana plants per rai (roughly 1,600 sqm) for land to count as genuinely agricultural, not just token planting.",
          "**The Ministries of Finance and Interior's 2025 Notification (No. 3) on Criteria for Agricultural Land Use**, effective 1 January 2025, expanded the schedule to 57 crop and tree categories and raised several density minimums — for example, the eucalyptus threshold rose from 35 to 100 trees per rai.",
          "**Falling short of the density schedule means the land is assessed as vacant/unused**, not agricultural — triggering the higher rate (and, for land idle three-plus years, the step-up on top of it) plus potential back-tax and penalties for prior years misclassified.",
          "**Local assessors have discretion to inspect and verify actual land use**, so sparse or clearly ornamental planting on a prime commercial plot is a specific, known audit target, not an overlooked formality.",
        ],
      },
      { h: "What this means for a Koh Phangan buyer" },
      "Most Right Way Phangan clients buy to build, not to bank vacant land, which limits direct exposure — but the step-up matters for anyone holding land through a longer permit or design process, or land bought speculatively ahead of a later build. See [Building a villa on Koh Phangan: permits, zones, timelines](/knowledge/building-a-villa-koh-phangan) for how long that gap can realistically run, and [Owner's taxes: annual land tax and tax on taking income out](/knowledge/owners-taxes-annual-land-and-income) for how the annual land tax fits into ownership costs generally. If a plot has standing agricultural use — coconut, fruit trees, or existing farming — confirm the planting meets the current density schedule with a local accountant before assuming the lower rate applies automatically; the criteria changed in 2025 and are being checked more closely in 2026.",
      "The practical takeaway is simple: a plot won't stay at its lowest tax bracket by default, whether that's because it sits idle past three years or because token planting no longer clears the agricultural bar on its own.",
    ],
    takeaways: [
      "From 2026 (B.E. 2569), land left unused for three consecutive years gets an automatic extra 0.3% added to its standard vacant-land tax rate, repeating every three years up to a 3% cap.",
      "Standard vacant-land rates already scale from 0.3% to 0.7% by value band before any step-up applies — a ฿100 million idle plot can go from ฿400,000 to ฿700,000 a year once the step-up hits.",
      "Agricultural land is taxed far lower (as little as 0.01% for individuals after a ฿50 million exemption), which is why token crop planting on vacant land — the 'banana tree loophole' — became widespread.",
      "A 2025 Ministry of Finance/Interior notification (effective 1 January 2025) expanded the qualifying-crop schedule to 57 categories and raised several density minimums, including eucalyptus from 35 to 100 trees per rai — closing off thin, ornamental planting as a way to qualify.",
      "Falling short of the density schedule gets land assessed as vacant, not agricultural, exposing the owner to both the higher rate and possible back-tax for prior years — verify actual planting against the current schedule rather than assuming an old rule of thumb still applies.",
    ],
    sources: [
      {
        title: "LEXbangkok — New Land and Building Tax Thailand 2026 (B.E. 2569): Full Guide for Property Owners",
        url: "https://lexbangkok.com/land-building-tax-thailand-2026/",
      },
      {
        title: "Nishimura & Asahi — Thai Government Begins Strict Enforcement of Agricultural Land Tax Planning Measures",
        url: "https://www.nishimura.com/en/knowledge/publications/20260316-120276",
      },
      {
        title: "The Nation — Landowners in Bangkok embrace 'agriculture' to escape vacant-land tax",
        url: "https://www.nationthailand.com/in-focus/30380704",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion: "Why did my Thai land tax bill jump in 2026, and does planting fruit trees still lower it?",
  },
  {
    slug: "thailand-will-registration-rules-2026",
    kbId: "kb-0053",
    topic: "Documents",
    title: "Thailand's new Will registration rules (24 March 2026): what property owners need to update",
    short:
      "A Ministerial Regulation that took effect on 24 March 2026 standardises how public wills are prepared, witnessed and registered at Thai district offices — the first overhaul of the process in over 60 years. It doesn't change who inherits what under Thai law, but it tightens the paperwork, and every foreign owner of Thai property should check their existing will still fits.",
    updated: "2026-07-11",
    body: [
      "**Does this change who inherits your Thai property? No — it changes how a will gets made and registered.** The Ministerial Regulation on the Preparation of Wills and Declarations of Intention Concerning Inheritance, B.E. 2569, was published in the Government Gazette on 22 January 2026 and took effect 60 days later, on 24 March 2026. It replaces an administrative framework that had gone essentially unchanged since the 1960s for the 'public will' (a will made and registered before a district officer) — the form most commonly recommended to foreign property owners because it is drafted and held by a government office, not a private drawer.",
      { h: "What actually changed" },
      {
        ul: [
          "**Uniform national forms** — the Department of Provincial Administration (DOPA) now prescribes standardised forms used at every district office, replacing inconsistent local practice.",
          "**Registration at any district office** — a testator can register a public will at any Amphur, King Amphur or Bangkok Khet office, not only the one covering their registered address.",
          "**An official will register** — each district office maintains a formal register of wills made before it, with a certified copy and receipt issued to the testator.",
          "**Stricter capacity and intent checks** — district officers are directed to more rigorously assess that the testator understands and freely intends the declaration, and to refuse a will where coercion or incapacity is suspected.",
          "**Clearer witness rules** — a public will still requires at least two qualifying witnesses; beneficiaries and their spouses cannot act as witnesses, and minors or those without full mental capacity are disqualified.",
        ],
      },
      { h: "What the process looks like now" },
      "The core steps stay recognisable: bring identification, a schedule of assets and two qualifying witnesses to a district office; declare your testamentary wishes orally to the officer; the officer records the declaration on the standardised form and reads it back for confirmation; testator, witnesses and officer sign, the office seal is applied, and the will is entered in the district register. The regulation is procedural — it does not touch the substantive inheritance rules in the Civil and Commercial Code that determine who your statutory heirs are if you die without a will, or how forced-heirship shares work.",
      { h: "Do you need to redo an existing will?" },
      "No. A public will registered before 24 March 2026 under the old procedure remains legally valid — the regulation is not retroactive and does not invalidate anything already on file. Voluntary re-registration under the new standardised forms is optional, and mainly useful if your existing will is old, poorly documented, or you want the clarity of the new official register. What is worth checking, regardless of registration date, is whether the will's content still matches what you actually own today.",
      { h: "Why this matters specifically for property owners" },
      "As set out in [Inheritance on Koh Phangan](/knowledge/inheritance-leasehold-and-villa), a leasehold, the villa building and any company shares pass to heirs in different ways under Thai law, and a lease does not transfer automatically unless the contract itself provides for it. A will only works if it correctly names and describes each of these Thai assets — the more standardised registration process is a good prompt to review that your will actually lists your current leasehold, the villa structure, and any Thai company shares by their correct legal description, not just 'my property in Thailand.'",
      {
        ul: [
          "**No citizenship or residency requirement** — a valid passport is sufficient to register a public will; you do not need a Thai visa, work permit or house registration to do it.",
          "**Bring an interpreter if you don't speak Thai** — the declaration and forms are in Thai, and a qualified interpreter is needed to confirm you understand what is being recorded.",
          "**Coordinate a Thai will with any will at home** — a separate Thai will covering only Thai assets, drafted so it doesn't unintentionally revoke a will made in your home country, is the standard advice from Thai law firms for foreign owners.",
          "**Certified translations** — if the will (or the district register's certified copy) needs to be used abroad, budget for a certified translation alongside the Thai original.",
        ],
      },
      "This is a paperwork-quality reform, not a change to inheritance law itself — but for a foreign owner, paperwork quality is exactly what determines whether your heirs get a smooth probate or a contested one. If your will predates a lease renewal, a company restructure, or simply hasn't been looked at in a few years, this is a reasonable moment to have a Thai lawyer confirm it against what you currently own. See also [Freehold condo vs leasehold villa for a foreigner](/knowledge/freehold-condo-vs-leasehold-villa) for how the asset type affects what an heir actually receives.",
    ],
    takeaways: [
      "A Ministerial Regulation effective 24 March 2026 standardises how public wills are made and registered at Thai district offices — the first such overhaul since the 1960s.",
      "It is procedural only: it does not change who inherits under the Civil and Commercial Code, and existing wills registered before the change remain valid without re-registration.",
      "New rules add uniform national forms, an official will register, registration at any district office regardless of domicile, and stricter capacity/witness checks.",
      "Foreigners need only a valid passport to register a public will — no visa, work permit or house registration required; bring a qualified interpreter if needed.",
      "Use the update as a prompt to check your Thai will correctly names your current leasehold, villa building and any company shares — a lease does not pass to heirs automatically without a succession clause.",
    ],
    sources: [
      { title: "Siam Legal — Thailand Updates Its Will and Inheritance Laws: What You Need to Know", url: "https://www.siam-legal.com/thailand-law/thailand-updates-its-will-and-inheritance-laws-what-you-need-to-know/" },
      { title: "LEXbangkok — Thai Will Ministerial Regulation 2569: New Rules for Making Wills in Thailand", url: "https://lexbangkok.com/thai-will-ministerial-regulation-2569/" },
      { title: "Silk Legal — Thailand Issues New Regulation Standardising Wills and Inheritance Procedures Before District Offices", url: "https://silklegal.com/thailand-issues-new-regulation-standardising-wills-and-inheritance-procedures-before-district-offices/" },
      { title: "Global Law Experts — Public Wills Thailand", url: "https://globallawexperts.com/public-wills-thailand/" },
    ],
    faqHref: "/faq",
    faqCategory: "documents",
    faqQuestion: "What is Thailand's new will registration rule from March 2026, and do I need to redo my existing will?",
  },
  {
    slug: "healthcare-schools-koh-phangan-families",
    kbId: "kb-0054",
    topic: "Phangan",
    title: "Healthcare and schools on Koh Phangan: what a relocating family actually gets",
    short:
      "Koh Phangan has private hospitals for day-to-day and emergency care and a small but real set of international schools and kindergartens — but both systems are smaller than Koh Samui's, and serious medical cases or older secondary-school kids are often referred off-island. Buying here with a family means planning around that ceiling, not assuming it doesn't exist.",
    updated: "2026-07-11",
    body: [
      "**Can you actually raise a family on Koh Phangan, or do you need to be near Samui? Both, depending on age and condition.** For most everyday healthcare and for pre-school through mid-secondary education, the island covers itself. For major surgery, complex specialist care, or the top tier of internationally accredited secondary education, residents routinely rely on Koh Samui (30–45 minutes by boat) or Bangkok. That split should factor into where on the island you buy, not just what the villa costs.",
      { h: "Healthcare on the island" },
      {
        ul: [
          "**Phangan International Hospital and First Western Hospital** — the main private facilities, with English-speaking staff, 24-hour emergency care, diagnostics (X-ray, some CT/lab capability), dentistry and outpatient services. This is where most residents and expats go for anything beyond a pharmacy visit.",
          "**Smaller private clinics** — including operators such as Ocean Medical Clinic near Haad Rin and other doctor/house-call services, for primary care and minor injuries.",
          "**Koh Phangan Hospital (government)** — cheaper, but generally recommended only for minor issues; equipment and specialist capacity are limited compared with the private hospitals.",
          "**Emergency numbers to have saved** — 1669 (ambulance, 24/7), 191 (general emergency), 1155 (English-speaking tourist police).",
        ],
      },
      "For anything serious — major trauma, complex surgery, cardiac or cancer care — patients are referred to larger hospitals on Koh Samui or flown/ferried to Bangkok. Foreigners, including long-term residents, are not covered by Thailand's Universal Coverage Scheme and rely on private insurance; Thai property-lawyer and expat guides commonly recommend cover of at least ฿3.5 million, from insurers such as Allianz, Cigna or Pacific Cross. Budget separately for medication: small island pharmacies don't reliably stock less common prescription drugs, so residents managing a chronic condition typically arrange a supply chain from Samui, Bangkok or abroad rather than assuming local availability.",
      { h: "Schools and kindergartens" },
      "Koh Phangan's education options have grown alongside its resident expat population, but the sector is still small relative to Samui or Phuket. For young children, the island covers itself comfortably; for the final years of secondary school, families increasingly weigh a move or a commute.",
      {
        ul: [
          "**Si Ri Panya International School (Ban Tai)** — the island's original licensed international school, Cambridge International/UK-based curriculum, primary through secondary; reported annual fees in the range of roughly ฿205,000–271,000 depending on year level.",
          "**Wisdom College (Thongsala)** — British curriculum at primary and lower-secondary, moving to an American-style structure at upper-secondary.",
          "**Amor Infinito Learning Center (Hin Kong)** and smaller kindergartens such as Little Seeds Nursery — Montessori/Waldorf-influenced, bilingual (English/Thai) early-years options.",
          "**Other small schools** (e.g. Fairfax Academy, Phangan Horizons) — newer or lower-profile operations; verify current licensing, accreditation and continuity directly before enrolling, since the smaller-school landscape here changes faster than Samui's.",
        ],
      },
      "The honest caveat repeated across island parenting guides: some Phangan schools have a fairly homogeneous, small student body, which can matter for a child's social and language exposure, and academic pathways at the top end of secondary are less established than on Koh Samui. Many families with older teenagers, or who want a fully accredited IB/IGCSE exit pathway, end up choosing a Samui school and commuting by the regular ferry links, or relocating when children reach that stage.",
      { h: "What this means for where you buy" },
      {
        ul: [
          "**If you have young children or work remotely with flexible schooling needs**, most of the island is workable — check drive time to your preferred school and clinic rather than assuming proximity.",
          "**If you have teenagers heading toward IB/IGCSE exams**, weigh proximity to the Thong Sala pier (for the Samui ferry commute) more heavily than you would for a couple without school-age kids.",
          "**Either way, treat healthcare and schooling as a due-diligence item alongside title and utilities** — see [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan) and [Utilities on Koh Phangan](/knowledge/utilities-water-electricity-internet-koh-phangan) for the same verify-before-you-commit approach applied to power, water and road access.",
        ],
      },
      "None of this rules Phangan out for families — plenty live here year-round with young children and manage healthcare and schooling comfortably. The point is to plan around the island's actual ceiling: solid for everyday needs, dependent on Samui or Bangkok for the top end of either system.",
    ],
    takeaways: [
      "Phangan International Hospital and First Western Hospital cover day-to-day and emergency private healthcare on-island; major surgery and specialist care are typically referred to Koh Samui or Bangkok.",
      "Foreigners are not covered by Thailand's Universal Coverage Scheme — private insurance of at least ฿3.5 million cover is the standard recommendation for residents.",
      "Si Ri Panya International School (Ban Tai) and Wisdom College (Thongsala) are the island's established international schools; a handful of smaller bilingual kindergartens cover early years.",
      "The island's education options thin out at upper-secondary level — many families move to, or commute via ferry to, Koh Samui for IB/IGCSE-track teenagers.",
      "Treat healthcare and school proximity as a due-diligence item when choosing where on the island to buy, alongside title, utilities and road access.",
    ],
    sources: [
      { title: "Phanganist — Hospitals and Medical Centres on Koh Phangan", url: "https://phanganist.com/koh-phangan-health-travel-guide-hospital-koh-phangan-life-article/hospitals-and-medical-centres-koh-phangan" },
      { title: "Islanders Properties — Emergency Medical Care on Koh Phangan", url: "https://islanders-properties.com/blog/medical-help-koh-phangan-117" },
      { title: "Islanders Properties — Education in Koh Phangan: International Schools and Kindergartens", url: "https://islanders-properties.com/blog/education-in-koh-phangan-98" },
      { title: "Nomad Mum — Koh Phangan International Schools: Full List", url: "https://nomadmum.com/koh-phangan-international-schools/" },
    ],
    faqHref: "/faq",
    faqCategory: "phangan",
    faqQuestion: "Are there good hospitals and schools on Koh Phangan for a family relocating there?",
  },
  {
    slug: "condo-foreign-ownership-quota-debate-2026",
    kbId: "kb-0055",
    topic: "Ownership",
    title: "Thailand's 49% condo foreign-ownership quota in 2026: why the real fight is to raise it, not cut it",
    short:
      "Online chatter claims tourist provinces like Phuket and Koh Samui could see the foreign condo quota shrink to 25-39%. Mainstream Thai reporting as of mid-2026 shows the opposite live debate: officials and developers are pushing to raise the national 49% cap to 70-75%, and nothing has changed in law either direction.",
    updated: "2026-07-13",
    body: [
      "Is Thailand about to cut the 49% foreign condo-ownership quota in tourist provinces? No — as of July 2026 the quota is unchanged, and the actual proposal under live discussion in mainstream Thai press is to raise it, not lower it in specific provinces. Claims of a province-tiered cut to 25-39% circulating in SEO blog content aren't backed by Bangkok Post, The Nation, Thai Examiner or Chiang Rai Times reporting on this debate.",
      { h: "What the law says today" },
      "The Condominium Act caps foreign freehold ownership at 49% of a project's total registered floor area — measured by area, not by number of units. The original 1979 Act set the ceiling at 40%; an amendment gazetted in 1999 raised it to the current 49%, where it has stood for over 25 years. A temporary window between 1999 and 2004 allowed up to 100% foreign ownership in some projects as a post-crisis stimulus measure, but that expired and the general 49% rule has applied nationwide since.",
      { h: "What's actually being debated in 2026" },
      {
        ul: [
          "**A proposal to raise the national cap to 70-75%** — backed by developers and reportedly under review by government officials, driven by roughly 350,000 unsold condominium units in greater Bangkok and a sharp drop in foreign (especially Chinese) buyer transfers: foreign unit transfers fell about 17% and Chinese transfer value fell nearly 43% year-on-year in early-2026 data.",
          "**Hotspots already at the ceiling** — in popular Phuket and Pattaya buildings, the 49% freehold quota is reportedly already fully allocated, meaning new foreign buyers in those specific projects can only buy on the secondary market or via leasehold, not new freehold units — this is the immediate pressure point cited for raising the cap.",
          "**A counter-voice arguing the opposite direction** — Dr. Sopon Pornchokchai, president of the Agency for Real Estate Affairs (AREA), has publicly urged tighter rules instead: a residency requirement before a foreigner can buy, and a minimum purchase price, to curb speculative buying rather than simply expanding the quota.",
          "**Foreign buyers already skew toward higher-value units** — REIC-linked data for Q1 2026 shows foreigners were about 13.6% of transferred condo units nationally but 23.9% of transaction value, underscoring the 'foreign enclave' and affordability concerns behind the pushback.",
        ],
      },
      { h: "Status: nothing has passed" },
      "No amendment bill has cleared Parliament in either direction as of this writing. Thailand's ordinary legislative process for a bill like this typically runs 8 to 18 months from introduction, so even if a proposal is formally tabled, a change is unlikely before late 2026 at the earliest — and any change would almost certainly apply to new transactions going forward, not unwind titles foreigners already hold.",
      { h: "What it means for a Phangan buyer" },
      {
        ul: [
          "**This quota doesn't touch you directly on Phangan** — the island has very few Condominium Act projects; the dominant structure here is a registered land lease plus ownership of the building, not a condominium unit. See [How foreigners legally own a villa on Koh Phangan](/knowledge/how-foreigners-own-a-villa).",
          "**It does affect the condo-vs-leasehold-villa comparison** if you're also weighing Samui or Phuket — a higher cap would mean more freehold condo inventory opens up in those markets; a win for the AREA-style tightening instead would leave the condo cap where it is but add buyer-eligibility friction. See [Freehold condo vs leasehold villa for a foreigner](/knowledge/freehold-condo-vs-leasehold-villa) for how the two structures actually compare.",
          "**Treat specific percentages you read online as unconfirmed** until they appear in the Government Gazette — a published notification, not a news article or blog post, is what actually changes the rule.",
        ],
      },
      "The one constant through this debate is enforcement, not the quota itself: regardless of where the 49% line ends up, Thai authorities have sharply increased scrutiny of nominee structures used to get around it — see [The Land Department's 2026 audit of existing landholding companies](/knowledge/land-department-audit-existing-landholding-companies-2026).",
    ],
    takeaways: [
      "The 49% foreign condo quota (measured by floor area) has stood since a 1999 amendment to the Condominium Act and remains unchanged as of July 2026 — no bill has passed Parliament.",
      "Mainstream 2026 reporting (Bangkok Post, Chiang Rai Times, Thai Examiner, The Nation) shows the live proposal is to raise the cap to 70-75%, not cut it in tourist provinces — claims of a 25-39% province-tiered reduction aren't corroborated by that reporting.",
      "The push to raise the cap is driven by roughly 350,000 unsold condo units in greater Bangkok and hotspots like Phuket and Pattaya where the 49% ceiling is reportedly already fully allocated in popular buildings.",
      "A minority voice (AREA's Dr. Sopon Pornchokchai) argues for tighter buyer-eligibility rules — a residency requirement and minimum purchase price — instead of raising the quota; neither side has become law.",
      "Phangan has very few Condominium Act projects, so this debate doesn't cap Phangan buyers directly — it mainly reshapes the freehold-condo-vs-leasehold-villa calculus for anyone also considering Samui or Phuket.",
    ],
    sources: [
      {
        title: "Bangkok Post — Foreign condo ownership quota being reviewed",
        url: "https://www.bangkokpost.com/business/general/2815396/foreign-condo-ownership-quota-being-reviewed",
      },
      {
        title: "Chiang Rai Times — Thailand's Foreign Condo Ownership Rules Come Under Over Enclave Fears",
        url: "https://www.chiangraitimes.com/business/thailands-foreign-condo-ownership/",
      },
      {
        title: "Thai Examiner — Despite a slump in foreign condo sales, property industry leader touts stricter Chinese-type controls",
        url: "https://www.thaiexaminer.com/thai-news-foreigners/2026/06/22/despite-a-slump-in-foreign-condo-sales-property-industry-leader-touts-stricter-chinese-type-controls/",
      },
      {
        title: "The Nation — Thailand urged to tighten rules on foreign condo ownership",
        url: "https://www.nationthailand.com/business/property/40067631",
      },
      {
        title: "Thailand Law Online — Foreign ownership and condominium laws (history of the 40%→49% quota)",
        url: "https://www.thailandlawonline.com/article-older-archive/foreign-ownership-and-condominium-laws",
      },
    ],
    faqHref: "/faq",
    faqCategory: "ownership",
    faqQuestion: "Is Thailand about to cut the 49% foreign condo-ownership quota in tourist provinces like Phuket and Koh Samui?",
  },
  {
    slug: "ocpb-deposit-ban-villa-land-reservations",
    kbId: "kb-0056",
    topic: "Costs",
    title: "OCPB's 2025 deposit-confiscation ban only covers condos — what protects a villa or land reservation deposit on Phangan?",
    short:
      "Since 31 January 2025, Thailand's consumer protection regulator has barred condo developers from keeping a reservation deposit when the buyer isn't at fault. The rule is written narrowly for condominium-unit reservations — villa and land reservations, which dominate Phangan's market, fall back to ordinary contract law, where a non-refundable clause is enforceable unless you negotiate otherwise.",
    updated: "2026-07-13",
    body: [
      "Does Thailand's new ban on developers confiscating reservation deposits apply to a villa or land purchase? No — it's written specifically for condominium units. Almost everything sold on Koh Phangan is a villa or bare land, not a Condominium Act unit, so this widely-reported consumer protection almost certainly doesn't cover your deposit.",
      { h: "What the OCPB notification actually bans — and for what" },
      {
        ul: [
          "**The rule**: the Notification Prescribing the Business of Selling Condominium Units Through Reservations as a Contract-Controlled Business B.E. 2567, gazetted 3 October 2024 and effective 31 January 2025 (120 days later).",
          "**What's prohibited**: a clause letting the developer confiscate all or part of a reservation payment while the buyer isn't in default; clauses excluding or limiting the developer's liability; and charging the buyer an assignment fee to transfer the reservation to someone else.",
          "**Penalty for violating it**: up to one year's imprisonment and/or a fine of up to ฿200,000 under the Consumer Protection Act — real enforcement teeth, but only for the sector it covers.",
          "**Defined scope**: the notification's own wording limits it to 'the business of selling condominium units through reservations.' Nothing in the text extends it to land, houses or villas.",
        ],
      },
      { h: "Why villa and land reservations sit outside it" },
      "For a business type to be bound by rules like this, the Contract Committee has to formally declare it a 'controlled contract business.' Condominium-unit reservation sales received that declaration in October 2024. Land and house reservation sales have not — no equivalent notification currently exists for them. That means a developer selling a villa or land plot on Phangan can still lawfully write a reservation agreement that forfeits your deposit for any reason, not just your own default.",
      { h: "The other law that might apply — and where it falls short" },
      "The Land Allocation Act (No. 3) B.E. 2568, effective 1 March 2026, does add real protection for buyers in licensed จัดสรรที่ดิน (land-allotment / housing-estate) projects: developers must now secure a bank or financial-institution guarantee to maintain shared infrastructure like roads, drainage and parks. That's a genuine improvement — but it addresses infrastructure upkeep, not reservation-deposit refunds, and it only reaches projects formally licensed as a land allotment. Many small villa developments on Phangan are sold plot-by-plot without that formal licence, which puts them outside this Act too.",
      { h: "The fallback: ordinary contract law" },
      "Absent a controlling statute, Section 378 of the Civil and Commercial Code sets the default rule for earnest money: if the buyer defaults, the deposit is forfeited; if the seller defaults or cancels, the deposit must be returned, with interest. That default rule can be overridden by what the contract itself says — and outside a declared 'controlled contract business,' Thai law lets a seller do exactly that. So for a villa or land reservation, whatever the printed form says about forfeiture is very likely what actually governs your money, not a general consumer-protection statute.",
      { h: "What to check before signing a reservation for a villa or land plot" },
      {
        ul: [
          "**Read the forfeiture clause literally** — does it forfeit your deposit only if you default, or does it say 'for any reason' or 'at the developer's discretion'?",
          "**Negotiate a refund right** if the seller cancels, misses an agreed deadline, or can't deliver clear title — don't assume Section 378's default protection is in the contract unless it's written in.",
          "**Ask whether the project is a licensed จัดสรรที่ดิน (land allotment)** and request the licence number — this matters for the Land Allocation Act's infrastructure guarantees and is a due-diligence item in its own right. See [Due diligence before buying on Koh Phangan](/knowledge/due-diligence-checklist-koh-phangan).",
          "**Tie payments to verifiable milestones** — survey completion, title verification, contract signing — rather than handing over a large deposit against a bare promise.",
          "**Have an independent Thai lawyer review the reservation agreement before you sign**, not just the final sale-and-purchase contract. See [The lease contract: clauses you must check](/knowledge/lease-contract-clauses-to-check) for the same negotiate-it-into-the-paper approach applied to lease terms.",
        ],
      },
      "The OCPB's January 2025 rule was genuine progress — and matters directly if you're also weighing a Samui or Phuket condo. But it's targeted relief, not a general one, and it doesn't reach the villa and land contracts that dominate Phangan's market. There, your deposit is protected by what you negotiate into the agreement, not by a statute working in the background.",
    ],
    takeaways: [
      "OCPB's Notification B.E. 2567 (effective 31 January 2025) bans developers from keeping a reservation deposit when the buyer isn't in default — but its defined scope is condominium-unit reservation sales only.",
      "Violating it carries up to one year's imprisonment and/or a ฿200,000 fine under the Consumer Protection Act — real enforcement, but only for the condo sector it covers.",
      "Villa and land reservation contracts — most of what's sold on Phangan — aren't a declared 'controlled contract business,' so a seller can still lawfully write a forfeit-for-any-reason clause into the paper.",
      "The Land Allocation Act (No. 3) B.E. 2568 (effective 1 March 2026) adds real protection for licensed land-allotment (จัดสรรที่ดิน) buyers, but around infrastructure maintenance guarantees, not deposit refunds — and many small Phangan developments aren't licensed allotments at all.",
      "Absent a controlling statute, Civil and Commercial Code Section 378's default earnest-money rule applies but can be contractually overridden — so the forfeiture clause you actually sign, ideally reviewed by an independent lawyer, is what protects your deposit.",
    ],
    sources: [
      {
        title: "Baker McKenzie InsightPlus — Thailand: New OCPB Notification - Condominium unit reservation as a contract-controlled business",
        url: "https://insightplus.bakermckenzie.com/bm/real-estate_1/thailand-new-ocpb-notification-condominium-unit-reservation-as-a-contract-controlled-business",
      },
      {
        title: "Tilleke & Gibbins — Thailand Specifies Form of Reservation Contract for Sale of Condo Units",
        url: "https://www.tilleke.com/insights/thailand-specifies-form-of-reservation-contract-for-sale-of-condo-units/",
      },
      {
        title: "Thailand PRD (Government Public Relations Department) — New land-allotment law takes effect 1 March 2026",
        url: "https://www.prd.go.th/th/content/category/detail/id/33/iid/481003",
      },
      {
        title: "Thailand Law Online — Civil and Commercial Code Sections 377-385 (Earnest and Stipulated Penalty)",
        url: "https://www.thailandlawonline.com/civil-and-commercial-code/377-385-earnest-and-stipulated-penalty",
      },
    ],
    faqHref: "/faq",
    faqCategory: "costs",
    faqQuestion: "Does Thailand's new ban on developers confiscating reservation deposits apply to villa and land purchases, or just condos?",
  },
];

export function getKbArticleBySlug(slug: string): KbArticle | undefined {
  return KB_ARTICLES.find((a) => a.slug === slug);
}