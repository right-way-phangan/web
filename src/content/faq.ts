/**
 * FAQ content adapted from `Right Way — FAQ (foreigners buying Phangan).md` (30 Q&A, EN).
 *
 * Copy adaptations from source per project rules:
 * - Q15: replaced 'under 15M THB / above 25M' with qualitative 'smaller-budget /
 *   larger transactions' (public-copy-no-prices).
 * - Q17: removed specific '3% of sale price' figure (was inconsistent with
 *   Services page where commission is 4% search fee paid by seller); now
 *   references the Services page for the published structure.
 * - Q27: removed price-per-rai figures per district (12-15M, 15-25M, etc. —
 *   conflicts with public-copy-no-prices and with adapted /districts pages),
 *   kept lifestyle matching guide.
 * - All other Q&A kept verbatim — they're either general market info, process
 *   detail, or examples, not RW client-segment pricing.
 */

export type FaqBlock =
  | string                                // paragraph (supports **bold**)
  | { ul: string[] }                       // bullet list
  | { table: { headers: string[]; rows: string[][]; note?: string } };

export interface FaqItem {
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: FaqBlock[];
}

export type FaqCategoryId =
  | "ownership"
  | "documents"
  | "structures"
  | "costs"
  | "process"
  | "phangan";

export const FAQ_CATEGORIES: Array<{ id: FaqCategoryId; title: string; lead: string }> = [
  {
    id: "ownership",
    title: "Foreign ownership basics",
    lead: "What foreigners can and can't own in Thailand.",
  },
  {
    id: "documents",
    title: "Land documents",
    lead: "Chanote, NS3, and how to read a Thai title.",
  },
  {
    id: "structures",
    title: "Ownership structures",
    lead: "Thai companies, leases, usufructs, spouse-owned land.",
  },
  {
    id: "costs",
    title: "Costs and taxes",
    lead: "Fees, transfer costs, annual taxes, repatriation.",
  },
  {
    id: "process",
    title: "Process and timeline",
    lead: "How long, what stages, what can go wrong.",
  },
  {
    id: "phangan",
    title: "Phangan-specific",
    lead: "Why this island, which districts, what to build.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "q1",
    category: "ownership",
    question: "Can foreigners own land in Thailand?",
    answer: [
      "No — foreigners cannot directly own land (Chanote / NS3) in their personal name in Thailand. This is a national law (Land Code Act, 1954) and applies everywhere, including Koh Phangan.",
      "Foreigners can, however, hold land **indirectly** through three legal structures: a Thai company, a long-term lease (Leasehold), or — in rare cases — a usufruct or inheritance arrangement. Each has trade-offs in cost, control, and resale.",
      "Foreigners **can** own **buildings** (villas, houses) in their personal name, separately from the land underneath. This is why most villa purchases involve a buildings-only transfer plus a long-term land lease.",
    ],
  },
  {
    id: "q2",
    category: "ownership",
    question: "What's the difference between Freehold and Leasehold?",
    answer: [
      "**Freehold** = perpetual ownership. The land Chanote (title deed) is registered to the owner forever. For Thais — direct ownership. For foreigners — through a Thai company (51% Thai-owned minimum) or other indirect structure.",
      "**Leasehold** = right to use the land for a fixed period, usually 30 years (the legal maximum for one lease term), often with extension options. The land Chanote remains in the lessor's name. The foreigner gets a registered lease at the Land Office, which is enforceable.",
      "**Trade-offs:**",
      { ul: [
        "Freehold via company — higher upfront cost, ongoing accounting (~30–50K THB/year), but resale value typically higher.",
        "Leasehold — lower upfront, no company maintenance, but resale depends on remaining lease term. A villa with 8 years left on its lease is harder to resell than one with 28 years.",
      ] },
    ],
  },
  {
    id: "q3",
    category: "ownership",
    question: 'Is "30+30+30 year lease" really 90 years?',
    answer: [
      "**Legally — no, not automatically.** Thai law allows one registered lease of maximum 30 years. The 30+30+30 structure is a contractual promise to renew, but each renewal must be **actively registered** at the Land Office at the end of the previous term.",
      "If the original lessor (or their heirs) refuses to honour the renewal, the foreigner has limited legal recourse — Thai courts generally hold that the maximum enforceable term is 30 years. Some lease contracts include penalty clauses, prepaid future rent, or company structures that strengthen the renewal, but none of these guarantee 90-year tenure.",
      "**Practical view:** treat a 30+30+30 lease as a strong 30-year asset with a moral commitment for extension. Don't pay a price that assumes 90 years of guaranteed use.",
    ],
  },
  {
    id: "q4",
    category: "ownership",
    question: "Can I use a Thai nominee to hold land for me?",
    answer: [
      "**This is illegal in Thailand.** Using a Thai citizen as a nominee — meaning they hold land in their name purely on your behalf, with no real ownership interest — violates the Land Code Act and can result in:",
      { ul: [
        "Forfeiture of the land",
        "Criminal charges for both parties",
        "Inability to enforce any private agreement with the nominee in court",
      ] },
      "The Thai company structure (51% Thai / 49% foreign) is legitimate **only** if the Thai shareholders are real investors with genuine economic interest. Companies with nominee Thai shareholders (passive holders, paid a fee) are subject to enforcement and have been investigated in recent years, particularly on Phangan and Phuket.",
      "Right Way will not facilitate or recommend nominee structures.",
    ],
  },
  {
    id: "q5",
    category: "ownership",
    question: "How is buying a villa different from buying land?",
    answer: [
      "Three structural differences:",
      { ul: [
        "**Foreigner can own the building** (villa, house) outright in personal name via a buildings-only transfer. The land underneath still requires one of the indirect structures.",
        "**Two separate transactions** typically — one for the land (via lease or company), one for the building (registered in your name at the Land Office).",
        "**Inspection scope differs.** A villa requires building-condition assessment (structure, roof, electrical, plumbing), not just title verification. Land requires boundary and zoning verification.",
      ] },
      "Cost-wise, a villa transaction has more line items (building inspection, structural engineer, possibly architect for renovation plans) but the land-side fees are similar to a land-only deal.",
    ],
  },

  // ---- Documents
  {
    id: "q6",
    category: "documents",
    question: "What is a Chanote, and how is it different from NS3 or other documents?",
    answer: [
      "Thai land documents form a hierarchy of certainty:",
      { ul: [
        "**Chanote (Nor Sor 4 Jor)** — the highest-quality freehold title. GPS-surveyed boundaries, full legal protection, registered at the Land Office. ~80% of marketable Phangan land is Chanote.",
        "**Nor Sor 3 Gor (NS3 Gor)** — confirmed possession with surveyed boundaries, can be upgraded to Chanote in many cases. Marketable but with slight title risk.",
        "**Nor Sor 3 (NS3)** — confirmed possession, boundaries not GPS-surveyed (walking boundaries with markers). More risk on boundary disputes.",
        "**Sor Kor 1** — informal possession rights, very limited transfer ability, generally not recommended for foreign buyers.",
        "**Por Bor Tor 5** — tax payment document, **not a title document**. Walking away from these is wise.",
      ] },
      "Right Way works almost exclusively with Chanote and Nor Sor 3 Gor. We will flag and explain any exception.",
    ],
  },
  {
    id: "q7",
    category: "documents",
    question: "Why are two visually similar Chanote plots priced so differently?",
    answer: [
      "Three factors usually explain large price gaps between visually similar plots:",
      { ul: [
        "**Location and access.** Distance to beach (every 100 m matters), road quality (concrete vs dirt), proximity to wellness clusters (Sri Thanu) or tourism zones (Haad Rin). 500 m can mean a 30–50% gap.",
        "**Zoning and building rights.** Phangan has zoned restrictions (May 2025 update). Some plots can build a 2-storey villa; neighbouring plots may be limited to 1 storey or 6 m height. This is invisible without DD.",
        "**Document quality and chain of title.** Clean Chanote with no liens, no co-owners, short chain (1–2 transfers) commands a premium over messy chains.",
      ] },
      "Cheap plots are often cheap for a reason — sometimes structural (zoning, access), sometimes legal (title issue), sometimes seasonal (urgent seller). Right Way's DD process identifies which category a discount falls into.",
    ],
  },
  {
    id: "q8",
    category: "documents",
    question: "What's the May 2025 Phangan zoning regulation everyone mentions?",
    answer: [
      "In May 2025, Koh Phangan introduced updated zoning regulations restricting building density, height, and use in specific zones to preserve the island's character and environment. Key effects:",
      { ul: [
        "**Coastal Zone B** (within 200 m of the high-water line) — strict height limits (typically 6 m), reduced building footprint, no commercial use on residential plots.",
        "**Mountain Zone E** — slope-based restrictions, road-access requirements, environmental approvals.",
        "**Wellness/Community Zone (Sri Thanu)** — preserved low-density character, building permits subject to community feedback.",
      ] },
      "Some plots that were buildable before May 2025 are now restricted. This is why DD must include current zoning verification, not just older zoning maps. A 2024 listing claiming buildable for 2-storey villa may no longer be accurate in 2026.",
      "Right Way verifies current zoning for every property we present, including coordinate-based zone lookup with the Land Office.",
    ],
  },
  {
    id: "q9",
    category: "documents",
    question: "Can the seller actually sell? How do I verify ownership?",
    answer: [
      "Three verification steps Right Way completes for every property:",
      { ul: [
        "**Land Office title search** (~1–2 days, ~500 THB) — confirms the Chanote is registered to the seller, with no liens, mortgages, or court orders. Reveals co-owners (sometimes 4–5 family members on one Chanote, all must consent to sell).",
        "**Identity check** — verifying the seller's Thai ID matches the name on the Chanote. If sold via Power of Attorney, the PoA must be notarised and current (within 30 days).",
        "**Chain of title review** — tracing the title back 2–3 transfers to ensure clean transfers, no fraud, no contested transfers. This is where ~70% of cheap plots turn out to have issues.",
      ] },
      "The verification cost is included in our DD process. Without these checks, a seemingly clean sale can be reversed years later if a court finds the original transfer was fraudulent.",
    ],
  },
  {
    id: "q10",
    category: "documents",
    question: "What if the document area (rai) and GPS-measured area don't match?",
    answer: [
      "Small discrepancies (< 2%) are common and usually within survey tolerance. Larger ones need investigation:",
      { ul: [
        "**0–2%** — normal, accepted by Land Office.",
        "**2–5%** — flag for review, often a recent fence move or neighbour encroachment. Resolvable.",
        "**5–10%** — significant, requires re-survey and possibly boundary-dispute resolution before purchase. We don't transact until resolved.",
        "**>10%** — major issue, often title fraud or unresolved historic dispute. Walk away.",
      ] },
      "Sometimes the document says 6 rai but the seller actually owns 5.7 rai (encroachment by a neighbour years ago, never resolved). The buyer either pays for 5.7 rai or insists the seller resolve the boundary before sale.",
      "Right Way performs GPS verification on every Chanote we list. Any discrepancy over 2% is documented in the property's data sheet.",
    ],
  },

  // ---- Structures
  {
    id: "q11",
    category: "structures",
    question: "How does the Thai company structure work for foreigners?",
    answer: [
      "A Thai limited company (Co. Ltd.) is a legitimate structure to hold land where 51% of shares are held by Thai shareholders and 49% by the foreigner. Key requirements:",
      { ul: [
        "**Real Thai shareholders.** Must be genuine investors with economic stake, not paid nominees. Typically a Thai partner you know well, a business associate, or a Thai director hired through a reputable firm.",
        "**Active company.** Real business activity (real-estate holding qualifies, but must file annual returns, pay accounting fees ~30–50K THB/year).",
        "**Foreign director with control rights.** Through articles of association — preferred shares, voting rights, or director appointments — the foreigner can maintain operational control despite minority equity.",
      ] },
      "**Cost to set up:** ~50–100K THB (lawyer + government fees), 1–2 months timeline. **Annual cost:** ~30–50K THB (accounting + filings).",
      "Right Way doesn't set up companies but works with 2–3 reputable Bangkok/Phuket firms who do. This is a question for a lawyer, not your real-estate agent.",
    ],
  },
  {
    id: "q12",
    category: "structures",
    question: "What's a usufruct? Is it the same as leasehold?",
    answer: [
      "Different. A **usufruct** is the legal right to use, possess, and benefit from land owned by someone else, typically for the lifetime of the usufructuary. It's registered at the Land Office and runs with the land if registered.",
      "Key differences from leasehold:",
      { ul: [
        "**Term:** lease = fixed (max 30 years registered). Usufruct = typically lifetime, but capped at 30 years if granted to a juristic person.",
        "**Inheritance:** usufruct generally ends at death and doesn't transfer to heirs (unless specifically structured). Leasehold can be assigned to heirs subject to lease terms.",
        "**Resale:** usufruct is harder to resell because you're transferring your personal right to use, not a marketable lease.",
      ] },
      "Usufruct is common in family-internal structures (Thai spouse owns land, foreign spouse gets lifetime usufruct) but uncommon in arms-length real-estate transactions.",
    ],
  },
  {
    id: "q13",
    category: "structures",
    question: "Can my Thai spouse buy land in their name, and we live there together?",
    answer: [
      "Yes — this is legally clean if structured correctly. The Thai spouse holds the Chanote in their name. To protect the foreign spouse, several optional structures:",
      { ul: [
        "**Lifetime usufruct** for the foreign spouse, registered at the Land Office.",
        "**Mortgage from foreign spouse to Thai spouse** for the value invested — creates a registered financial claim.",
        "**Pre-marital agreement** specifying the property is separate (not marital community property).",
        "**Will** specifying inheritance and right of residence.",
      ] },
      "**Important:** Thai law requires the foreign spouse to disclaim ownership intent when the Thai spouse buys land. A statement is signed at the Land Office that the foreign spouse contributed no funds. This is true if the Thai spouse genuinely funds the purchase from their own resources, untrue if the foreign spouse provides the money.",
      "This is a domain where a qualified family-law-aware Thai lawyer is essential, not a real-estate agent.",
    ],
  },
  {
    id: "q14",
    category: "structures",
    question: "What happens to my Thai company after I die? Who inherits?",
    answer: [
      "Three layers of inheritance matter:",
      { ul: [
        "**Your 49% shares in the Thai company** are personal property and pass according to your will (or Thai intestate succession if no will). Foreign heirs can inherit shares.",
        "**The land itself** stays with the company — no separate inheritance of the land. The company continues, with new shareholders inheriting the 49%.",
        "**Operational control** — your articles of association determine if your heirs inherit your director position or just the economic stake.",
      ] },
      "**Practical advice:**",
      { ul: [
        "Make a will specifying the Thai company shares — in your will from home country, or a separate Thai will.",
        "Update articles to clarify director succession.",
        "Inform your heirs that the structure exists and where the papers are.",
      ] },
      "Without a will, inheritance falls to Thai intestate rules, which can take 1–2 years in probate.",
    ],
  },
  {
    id: "q15",
    category: "structures",
    question: "Lease vs Company — which is better for my situation?",
    answer: [
      "Depends on three things: time horizon, capital, and family situation.",
      "**Leasehold typically better when:**",
      { ul: [
        "Time horizon ≤ 15–20 years",
        "You don't want ongoing accounting or corporate maintenance",
        "The property is for personal use (not income-generating)",
        "Capital is constrained (avoid company setup cost)",
      ] },
      "**Company (Freehold) typically better when:**",
      { ul: [
        "Time horizon ≥ 20 years, especially with family succession plans",
        "The property generates income (rental, business) — a company structure makes operations cleaner",
        "You want maximum resale flexibility",
        "You're comfortable with annual ~30–50K THB compliance costs",
      ] },
      "For smaller-budget purchases, lease is often simpler. For larger transactions, the company structure is usually worth the overhead.",
      "Right Way provides a one-page comparison per property at viewing time, but the legal recommendation always comes from a Thai lawyer.",
    ],
  },

  // ---- Costs
  {
    id: "q16",
    category: "costs",
    question: "What are the total costs beyond the purchase price?",
    answer: [
      "Typical all-in costs for a land purchase (example based on a 15M THB transaction):",
      {
        table: {
          headers: ["Item", "Approximate THB", "% of price"],
          rows: [
            ["Purchase price", "15,000,000", "100%"],
            ["Land Office transfer fee (2% of appraised, often split per practice)", "50K–100K", "0.3–0.7%"],
            ["Specific Business Tax (3.3%, paid by seller if held < 5 yr)", "—", "—"],
            ["Stamp duty (0.5%, if applicable)", "0–75K", "0–0.5%"],
            ["Withholding tax (1% of appraised, paid by seller)", "—", "—"],
            ["Lawyer fees (DD + contract + transfer)", "80K–150K", "0.5–1%"],
            ["Surveyor (GPS boundary verification)", "15K–30K", "0.1–0.2%"],
            ["Translation and notarisation", "5K–15K", "<0.1%"],
            ["Buyer total beyond price", "~150K–300K", "1–2%"],
          ],
          note: "For villa purchases, add structural inspection (~30K THB). Transfer fees apply to both land lease and building registration.",
        },
      },
    ],
  },
  {
    id: "q17",
    category: "costs",
    question: "Who pays the agent commission?",
    answer: [
      "**Standard practice on Phangan:** the seller pays the agent commission. Foreign buyers typically pay zero commission for listed properties.",
      "Our published commission structure is on the [Services page](/services) — base fee plus search fee paid by the seller, with a small premium for complex company structures paid by the buyer.",
      "Exceptions exist:",
      { ul: [
        "**Buyer-side representation** — if you engage Right Way as your advocate (DD only, market analysis, multiple-property assessment) without a property of ours, we negotiate a flat advisory fee, typically 1.5–2% of eventual purchase price.",
        "**Exclusive search mandate** — if you want Right Way to search the market beyond our listed inventory for a specific brief, we may charge a retainer plus success fee.",
      ] },
      "All commission terms are transparent before the first viewing.",
    ],
  },
  {
    id: "q18",
    category: "costs",
    question: "What's the annual property tax in Thailand?",
    answer: [
      "Two relevant taxes:",
      { ul: [
        "**Land and Building Tax** (Act 2019). Residential property used by the owner: 0.02–0.10% of appraised value annually. Vacant or rented residential: higher rates up to 0.30%. Commercial: 0.30–0.70%. Vacant unused land: 0.30%, increasing by 0.30% every 3 years.",
        "**House and Land Tax** (older, applies to rental income from house/land) — 12.5% on annual rental value, applicable mostly to commercial use.",
      ] },
      "For a typical residential plot held by a Thai company, expect ~5,000–15,000 THB/year in property tax depending on appraised value (usually lower than market value).",
      "Right Way doesn't file taxes for clients but recommends a Thai accountant or tax advisor for compliance.",
    ],
  },
  {
    id: "q19",
    category: "costs",
    question: "How do I transfer money to Thailand for the purchase?",
    answer: [
      "Buyers typically transfer funds from a home-country bank to Thailand via:",
      { ul: [
        "**SWIFT international transfer** to the lawyer's escrow account or to the seller directly at closing. Bank charges $50–200 per transfer.",
        "**Wise (formerly TransferWise)** for amounts up to ~5M THB per transaction — significantly cheaper FX (0.4–0.6% spread vs 2–3% bank).",
        "**Multiple smaller Wise transfers** are common for larger purchases, though banks may flag patterns; structure with the lawyer's input.",
      ] },
      "**Important:** keep the **Foreign Exchange Transaction Form (FET)** — a document the receiving Thai bank issues when funds arrive from abroad in foreign currency. The FET is required to remit funds back out of Thailand when you eventually sell. Without it, repatriating proceeds is much harder.",
      "Receiving bank should be a major Thai bank (Bangkok Bank, Kasikorn, SCB). The lawyer typically opens an account or uses their client escrow.",
    ],
  },
  {
    id: "q20",
    category: "costs",
    question: "When I sell, what taxes do I pay?",
    answer: [
      "When selling, the seller typically pays:",
      { ul: [
        "**Specific Business Tax (SBT)** — 3.3% of sale price (3% + local tax), if you held the property < 5 years. Waived if > 5 years.",
        "**Withholding tax** — 1% of appraised value (deducted at transfer).",
        "**Personal income tax** — applied to gain on sale, progressive rate. For property held > 5 years, deductions are available; under 5 years, full gain is taxable.",
        "**Transfer fee** — 2% of appraised value, often split with the buyer per local practice.",
      ] },
      "For a Thai company selling property: corporate income tax (20% on profit) applies to the gain, not personal income tax.",
      "**Repatriation of proceeds:** with the FET form from your original purchase, funds can be remitted back in foreign currency. Banks require documentation: FET, sale contract, evidence funds came from abroad.",
    ],
  },

  // ---- Process
  {
    id: "q21",
    category: "process",
    question: "How long does a typical purchase take from start to finish?",
    answer: [
      "A typical timeline for a foreign buyer purchasing land on Phangan:",
      {
        table: {
          headers: ["Phase", "Duration", "Activities"],
          rows: [
            ["Search & initial viewings", "1–4 weeks", "Shortlist, photos, virtual tours, first viewing trip"],
            ["Selected property → DD start", "1 week", "Verbal/written intent, ~5–10K THB hold deposit"],
            ["Due Diligence", "3–6 weeks", "Title search, GPS survey, zoning verification, structural (for villas), owner verification"],
            ["Negotiation & contract", "1–2 weeks", "Price finalisation, SPA draft, lawyer review"],
            ["Funds transfer & closing", "1–3 weeks", "Bank transfer, signing, Land Office transfer"],
            ["Total", "8–16 weeks", "~2–4 months end-to-end"],
          ],
          note: "Fast scenarios (clean Chanote, buyer present, no negotiation): ~6 weeks. Slow (company setup, currency issues, contested title): 6+ months.",
        },
      },
    ],
  },
  {
    id: "q22",
    category: "process",
    question: "Do I need to be physically present in Thailand to buy?",
    answer: [
      "For most of the process, no. For the Land Office transfer day itself, presence is strongly preferred but not absolutely required.",
      "**Can be done remotely:**",
      { ul: [
        "Initial property research, photos, virtual tours",
        "Due Diligence (lawyer and Right Way handle)",
        "Contract review and signing (DocuSign or wet signature by mail)",
        "Funds transfer",
      ] },
      "**Strongly prefer in-person:**",
      { ul: [
        "At least one viewing trip — virtual tours don't reveal everything (smells, sounds, neighbours, road quality, mosquitoes).",
        "Land Office transfer day — your physical signature on the Chanote registration. If unavoidably absent, requires a notarised Power of Attorney (PoA) signed at a Thai embassy in your home country, valid for 30 days.",
      ] },
      "**Right Way's experience:** ~80% of completed transactions involve buyers physically present at transfer; 20% via PoA. Both work; in-person is smoother.",
    ],
  },
  {
    id: "q23",
    category: "process",
    question: "Can I negotiate the price?",
    answer: [
      "Yes, but realistically:",
      { ul: [
        "Land prices on Phangan have been firm 2023–2026. Demand from foreign buyers keeps sellers from significant discounts.",
        "Typical negotiation range: 3–8% off the asking price. Sometimes 10–15% if the seller is motivated (divorce, financial pressure, long-listed property), rarely beyond 15%.",
        "Off-asking is rare. Sellers who refuse 5–10% off are usually firm. Pushing harder often kills the deal.",
      ] },
      "**Strong negotiation points:**",
      { ul: [
        "Documented title issues (resolved via re-survey or chain cleanup, cost-shared)",
        "Boundary disputes requiring resolution",
        "Building-rights restrictions (e.g., Zone B coastal limit) the seller didn't mention",
        "Comparable transactions Right Way can show",
      ] },
      "**Weak negotiation points:**",
      { ul: [
        '"I\'m not local" — sellers don\'t care',
        '"I have cash ready" — most Phangan transactions are cash; not a meaningful advantage',
        '"I\'ll close quickly" — sellers prefer certainty but rarely cut > 2–3% for it',
      ] },
    ],
  },
  {
    id: "q24",
    category: "process",
    question: "What happens if I want to back out mid-process?",
    answer: [
      "Depends on the stage:",
      { ul: [
        "**Before any deposit** — no consequence, but professional courtesy is to communicate clearly with Right Way and the seller.",
        "**After holding deposit (~5–10K THB) but before SPA signing** — the holding deposit is usually forfeited (it's small, designed for this). No further liability.",
        "**After SPA signing, before transfer** — contract terms govern. Most SPAs we draft include buyer-protection clauses — if DD reveals serious title issues, the buyer's deposit is refunded. For buyer-side change of mind without cause, deposits (typically 10% of price) may be forfeited.",
        "**After transfer** — the property is yours. Backing out means a re-sale, with all costs and time involved.",
      ] },
      "Good practice: be transparent with Right Way and the seller's lawyer as soon as doubts arise. We help renegotiate, delay, or unwind cleanly. Surprises at the last minute damage relationships and cost more.",
    ],
  },
  {
    id: "q25",
    category: "process",
    question: "What can go wrong, and how do you protect against it?",
    answer: [
      "Top 5 risks for foreign buyers on Phangan, with mitigations:",
      { ul: [
        "**Title fraud / contested ownership** — 8–12% of cheap plots have title issues. *Mitigation:* Land Office search + chain-of-title review = standard DD. We don't transact without it.",
        "**Boundary disputes** — neighbour encroachment, fence drift, GPS-vs-document mismatch. *Mitigation:* GPS survey + on-site boundary walk with seller. Buyer signs off on boundaries before transfer.",
        "**Building-rights restriction** — Zone B coastal limit, slope restriction, Phangan May 2025 rules. *Mitigation:* coordinate-based zoning verification with Land Office during DD.",
        "**Company structure compliance** — Thai shareholders found to be nominees, government investigation. *Mitigation:* use only firms with reputable, traceable Thai shareholders; pay them genuine fees; file annual returns; don't use shell structures.",
        "**Capital repatriation difficulty** — losing FET form, no foreign-currency evidence on transfer-in. *Mitigation:* original purchase via SWIFT or Wise with FET issued; archive FET, sale contract, all bank documents indefinitely.",
      ] },
      "Right Way's DD process is designed to catch the first three. Risks 4 and 5 are managed by your lawyer and accountant.",
    ],
  },

  // ---- Phangan-specific
  {
    id: "q26",
    category: "phangan",
    question: "Why Koh Phangan specifically? How does it compare to Samui or Phuket?",
    answer: [
      "Three differences shape Phangan's market:",
      { ul: [
        "**Stage of development.** Samui is a mature resort — high prices, dense development, established infrastructure. Phuket is an international real-estate market with foreign-buyer offering at scale. Phangan is the next-stage market — infrastructure improving (ferry frequency, road quality, internet), but prices still well below comparable Samui inland plots.",
        "**Buyer demographic.** Samui draws families, retirees, holiday-home buyers. Phuket draws investors, condo buyers, broad international mix. Phangan draws conscious living, wellness, creators, remote-first professionals. Different value drivers.",
        "**Zoning and character.** Phangan's May 2025 zoning prioritises low-density, wellness-coded development. It limits 2–3 storey buildings in most areas, preserves green space, restricts commercial sprawl. This protects long-term value but means slower development.",
      ] },
      "Phangan is for buyers who want what Phangan is — quieter, more nature, more wellness-coded community. Not for those who want urban density or large international airport access (3-hour ferry + flight to Bangkok).",
    ],
  },
  {
    id: "q27",
    category: "phangan",
    question: "Which district of Phangan is right for me?",
    answer: [
      "Match yourself by lifestyle, not by price alone:",
      { ul: [
        "**Yoga / wellness community** → Sri Thanu",
        "**Family, walkable beach** → Haad Yao or Ban Khai",
        "**Local culture, low-key fishing village** → Chaloklum",
        "**Solitude, established residential** → Madeau Wan or Haad Salad",
        "**Convenience, services, port access** → Ban Tai",
        "**Long-term hold, lifestyle-driven appreciation** → Sri Thanu or Haad Yao",
      ] },
      "Each district has its own price profile and inventory mix. See the [Districts](/districts) page for a full read on character, audience, and what to expect. For specific listings, the [Listings](/listings) catalogue filters by district.",
    ],
  },
  {
    id: "q28",
    category: "phangan",
    question: "Is Phangan a good investment? What returns can I expect?",
    answer: [
      "Honest answer: **Phangan is primarily a lifestyle market, secondarily an investment market.** Reasons:",
      { ul: [
        "Land appreciation has been 6–10% per year in good locations over the past 5 years. Not Bitcoin returns, but stable.",
        "Rental yield is modest — 4–7% gross on villa rentals, lower on land. After management, maintenance, vacancy, and tax, net yields land at 2–4%.",
        "Liquidity is moderate — selling a Phangan property typically takes 4–12 months. Not instant like stocks.",
      ] },
      "**Where Phangan works as an investment:**",
      { ul: [
        "Long horizon (5+ years), riding overall appreciation plus selective improvements (clear title, GPS survey, fencing) that increase resale value",
        "Premium plots near beach or established wellness clusters that resist downturns",
        "Build-and-hold strategies (buy land, build a modest villa for rental, sell as a complete asset)",
      ] },
      "**Where Phangan doesn't work:**",
      { ul: [
        "Quick flips (high transaction costs eat returns)",
        "Pure rental yield optimisation (yields lower than commercial real estate elsewhere)",
        "Anyone needing liquidity within 1–2 years",
      ] },
      'For most foreign buyers, the right framing is "buy what you\'d love to use, plus reasonable appreciation."',
    ],
  },
  {
    id: "q29",
    category: "phangan",
    question: "Can I build whatever I want on the land I buy?",
    answer: [
      "No — buildable plots have constraints:",
      { ul: [
        "**Zoning** (per Phangan May 2025) — height, density, setback rules vary by zone (Coastal, Mountain, Wellness-Community, etc.). Some plots are limited to 1 storey only.",
        "**Building permit** — issued by the local Tessaban (municipal office). Architects submit plans, environmental assessment for >500 sqm builds, ~2–4 months approval timeline.",
        "**Special protections** — within 200 m of the high-water line: extra restrictions. Within national parks (some south-east Phangan): no new builds. Coastal zone B: typically 6 m height max.",
      ] },
      "**What's typical for a residential Phangan villa:**",
      { ul: [
        "1–2 storeys, often 1.5 storey to maximise sea view from upper deck",
        "Pool, garden, low-impact materials (wood, glass, concrete with green roof)",
        "Sustainable additions (solar, rainwater) often encouraged by Tessaban, sometimes giving a zoning bonus",
      ] },
      "**What's typically problematic:**",
      { ul: [
        "3+ storeys (rarely permitted)",
        "Direct beachfront with structural foundations < 200 m from high-water line",
        "High-density residential subdivisions — Phangan May 2025 limits these",
      ] },
      "Right Way provides zoning data per plot, but specific design and build-permit work is done by your architect.",
    ],
  },
  {
    id: "q30",
    category: "phangan",
    question: "Does Right Way do property management, rentals, or construction?",
    answer: [
      "**No.** Right Way focuses exclusively on:",
      { ul: [
        "Buying and selling land, villas, and houses on Koh Phangan",
        "Due diligence on properties",
        "Transaction support (lawyer coordination, document handling, transfer)",
      ] },
      "We **do not** offer:",
      { ul: [
        "Property management",
        "Short-term or long-term rentals",
        "Construction services",
        "Renovation or interior design",
        "Holiday rentals",
      ] },
      "This is intentional. Real estate done well requires depth; managing rentals, builds, and brokering simultaneously creates conflicts of interest and dilutes quality.",
      "We refer to trusted partners for management, construction, and design when clients need them. Our referrals are based on years of working with these firms — no kickbacks, just genuine recommendations. We're transparent about who we refer to and why.",
    ],
  },
];

/**
 * Lowercased search index. Used by client-side filter on /faq.
 */
export function buildFaqSearchText(item: FaqItem): string {
  const parts: string[] = [item.question];
  for (const block of item.answer) {
    if (typeof block === "string") parts.push(block);
    else if ("ul" in block) parts.push(...block.ul);
    else if ("table" in block) {
      parts.push(...block.table.headers);
      for (const row of block.table.rows) parts.push(...row);
      if (block.table.note) parts.push(block.table.note);
    }
  }
  return parts.join(" ").toLowerCase();
}
