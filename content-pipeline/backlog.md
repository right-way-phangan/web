# Content pipeline — topic backlog (CI source of truth)

Operational queue the daily GitHub Action reads. The autonomous routine picks the
top undone topics, authors guides, then marks them done here. The richer planning
doc lives at `knowledge-base/backlog.md` (synced occasionally; this file is what CI uses).

Priority: 🔴 fresh news signal (do first) · 🟢 high evergreen · 🟡 medium · ⚪️ later.
Status: ⏳ queued · ✅ published.

> Dedup is enforced against the actual slugs already in `src/content/knowledge-base.ts` —
> never re-publish an existing slug even if it appears ⏳ here.

## A. News / live-source driven (move 🔴 to top as they appear)

| Topic | faqCategory | Priority | Status |
|---|---|---|---|
<!-- discovered 2026-07-26, sources: khaosodenglish.com, nationthailand.com, thailand-construction.com, ehang.com -->
| The 74-billion-baht Samui sea bridge/expressway (EXAT's 37km Don Sak-Khanom-Koh Samui link): 2026 feasibility study, 2029 construction start, and what a 20-minute mainland crossing (vs. today's 2-hour ferry) would do to Phangan and Koh Tao property demand | phangan | 🔴 | ✅ |
| Electric autonomous air-taxi service (EH216-S passenger drones) planned to connect Koh Samui, Koh Phangan and Koh Tao by late 2026: real project or vaporware, and what it means for buyer accessibility versus the stalled fixed-wing airport | phangan | 🔴 | ✅ |
<!-- discovered 2026-07-19, sources: thaiexaminer.com, silklegal.com, aimbangkok.com, globallawexperts.com -->
| Koh Samui/Phangan-specific nominee company flagging (reportedly ~68% of registered firms on the two islands flagged, per DSI/Land Dept enforcement data): what it means for buyers of a villa already held via a Thai company | ownership | 🔴 | ✅ |
| Land Code Section 94 amendment under study — forced-sale-within-a-year could become outright forfeiture to the State: why owners in questionable structures should regularize now, not later | structures | 🔴 | ✅ |
| DBD's 2026 source-of-funds rules (Orders 2/2568 and 1/2569): new bank-statement and Investment Confirmation Letter requirements when incorporating or amending a Thai property-holding company | documents | 🔴 | ✅ |
<!-- discovered 2026-07-12, sources: asterofasia.com, thaiexaminer.com, restproperty.com, bambooroutes.com, nationthailand.com, khaosodenglish.com, ancra.my, pattayamail.com -->
| Could the 49% condo foreign-ownership quota shrink to 25-39% in tourist provinces (Phuket/Samui/Pattaya-tier)? What's actually being proposed for 2026 and what it means for buyers weighing condo vs. leasehold villa | ownership | 🔴 | ✅ |
| OCPB's new off-plan deposit-confiscation ban (effective Jan 2025): does this condo-focused consumer protection actually apply to villa/land pre-sales on Phangan? | costs | 🔴 | ✅ |
| PEA's 2026 rooftop solar feed-in scheme (applications opened 1 July 2026, 2.20 THB/kWh, 10-year PPA): what it means for villa owners' running costs and payback math | costs | 🔴 | ✅ |
| Flood risk and drainage due diligence: assessing a specific plot's runoff exposure after Phangan's recent monsoon-season disaster-area declarations | process | 🔴 | ✅ |
| The "Samui Model" drone/GPS enforcement task force expands to Phangan (2026): retroactive risk for owners of existing hillside villas built years ago | structures | 🔴 | ✅ |
<!-- discovered 2026-07-05, sources: silklegal.com, zagdim.com, nationthailand.com, lexbangkok.com, thaienquirer.com, thaiembassy.com, siam-legal.com -->
| Land Department's nationwide audit of *existing* landholding companies (IBAS AI system, Section 96 forced divestment within 180 days-1yr, state auction risk) — what current company-structure owners must have ready | structures | 🔴 | ✅ |
| Vacant-land tax step-up in 2026 (extra 0.3% after 3 years unused) and the "banana tree" agricultural-use loophole crackdown | costs | 🔴 | ✅ |
| Thailand's new Will registration rules (effective 24 March 2026): what property owners need to update in their estate planning | documents | 🔴 | ✅ |
<!-- discovered 2026-07-02, sources: austchamthailand.com, nationthailand.com, silklegal.com, khaosodenglish.com, en.zonesamui.com -->
| Supreme Court voids "30+30+30" lease renewal clauses (March 2025 ruling) — what it means for stacked-lease villas | structures | 🔴 | ✅ |
| Thailand's proposed 99-year leasehold bill: where it stands and what changes if it passes | structures | 🔴 | ✅ |
| Department of Lands' May 2026 "Most Urgent" circulars: new source-of-funds checks at registration | process | 🔴 | ✅ |
| Illegal hillside and forest-reserve construction crackdown on Koh Phangan (2025 GPS mapping sweep) | phangan | 🔴 | ✅ |
| Forged building permits scandal on Koh Phangan (March 2026): how to verify a permit is real | phangan | 🔴 | ✅ |
| Nominee-ownership crackdown spreads to Krabi (villa raids) — what it means for island buyers | structures | 🔴 | ✅ |
| "Now is the time to buy" (Colliers take on market resilience) — what's true for Phangan | costs | 🟡 | ✅ |

## B. Evergreen long-tail (daily backbone)

| Topic | faqCategory | Priority | Status |
|---|---|---|---|
| Due diligence before buying: checklist for vetting the plot and the seller | process | 🟢 | ✅ |
| Selling your leasehold villa later (exit and liquidity) | process | 🟢 | ✅ |
| A day at the Land Office: what happens when a deal is registered | process | 🟢 | ✅ |
| Bringing money into Thailand correctly: the FET form step by step | costs | 🟢 | ✅ |
| Superficies vs usufruct vs lease: three ways to anchor your building | structures | 🟢 | ✅ |
| Renewing a 30-year lease: how it really works and the risks | structures | 🟢 | ✅ |
| A Thai company for property (49/51): when it makes sense, when it's toxic | structures | 🟢 | ✅ |
| Building a villa on the island: permits, zones, timelines, budgets | phangan | 🟢 | ✅ |
| Island eco-zoning (2025 law): where you can and can't build | phangan | 🟢 | ✅ |
| Utilities: water, power, internet and road access to a plot | phangan | 🟡 | ✅ |
| Owner's taxes: annual land tax and tax on taking income out | costs | 🟡 | ✅ |
| The lease contract: clauses you must check (succession, renewal, assignment) | documents | 🟢 | ✅ |
| Chanote vs Nor Sor 3 Gor in practice: how to read a cadastral plan | documents | 🟡 | ✅ |
| Visa and residency for a property owner: what a purchase does and doesn't give | phangan | 🟡 | ✅ |
| Phangan market seasonality: when to buy and when to sell | costs | ⚪️ | ✅ |
<!-- discovered 2026-07-02, sources: fosrlaw.com, thethaiger.com, nationthailand.com, phanganist.com, bestbkkcondos.com -->
| New OCPB residential leasing rules for landlords renting 3+ units: deposit caps and contract requirements | costs | 🟡 | ⏳ |
| Water supply and shortage risk on Koh Phangan: what it means for a villa's operating costs | phangan | 🟡 | ⏳ |
| New villa and residential development pipeline 2025-2026: named projects and what they signal | phangan | 🟡 | ⏳ |
| Healthcare and schools access for buyers relocating with family | phangan | 🟢 | ✅ |
| Realistic villa rental yields: what actually drives returns beyond the headline percentage | costs | 🟡 | ⏳ |
<!-- discovered 2026-07-05, sources: aseanbriefing.com, houseviser.com, thaienquirer.com (search snippets), thethaiger.com, centreforaviation.com, thailand-construction.com -->
| The THB 40 million investment route: how a foreigner can legally hold up to 1,600 sqm of land in their own name | structures | 🟢 | ✅ |
| Untitled "sea-view land" scams: why cheap PBT5/Sor Por Kor plots overlapping national park or forest reserve boundaries can never get a chanote | documents | 🟢 | ✅ |
| Insuring a villa on Koh Phangan: what flood and storm coverage actually costs, and where standard policies fall short | costs | 🟢 | ✅ |
| The right of habitation: Thailand's overlooked fourth registered property right (and when it beats usufruct) | structures | ⚪️ | ⏳ |
| Is a Koh Phangan airport actually coming? The abandoned Kan Air/national-park dispute and what it means for buyers today | phangan | ⚪️ | ⏳ |
<!-- discovered 2026-07-12, sources: srpplaw.com, lexology.com, oceanwwp.com, bakermckenzie.com, libothai.com, khaosodenglish.com, malaymail.com, dda-realestate.com -->
| Selling a Thai company that holds your villa: is a share-sale really a tax shortcut versus a land transfer, and where does the Revenue Department draw the line? | structures | 🟢 | ✅ |
| Disputing your Land and Building Tax bill: the assessment appeal process, deadlines and evidence needed | costs | 🟡 | ⏳ |
| Buying next to undeveloped land: how to check what can legally be built beside your plot before you commit | process | 🟡 | ⏳ |
<!-- discovered 2026-07-19, sources: propertyscout.co.th, phuketrealtor.com, archi-studio.asia, re.sukhothaiinterlaw.com, fosrlaw.com, kinnara.asia, islanders-properties.com, samuiforsale.com -->
| Withholding tax on a property sale: how the individual-seller calculation (years-owned deduction, progressive rates) differs from a company's flat 1% | costs | 🟢 | ⏳ |
| Coastal setback rules in practice: exact height, floor-area and open-space limits by distance-from-beach zone | structures | 🟢 | ⏳ |
| Hillside building limits in practice: the altitude and slope-percentage tiers that decide what you can actually build | structures | 🟢 | ⏳ |
| The LTR visa's property-investment route: how a USD 500k+ real estate purchase unlocks 10-year residency and tax perks | ownership | 🟢 | ⏳ |
| Managing a rental villa remotely: how to vet a property-management company (fees, contracts, red flags) | process | 🟢 | ⏳ |
| Specific Business Tax's 5-year exemption: how the clock is counted and which transfers qualify | costs | 🟡 | ⏳ |
| Protecting a foreign spouse's interest in property bought during a Thai marriage: usufruct and superficies in practice | structures | 🟡 | ⏳ |
<!-- discovered 2026-07-26, sources: solarpanelsthailand.com, solar-phangan.com, thailawonline.com, hospitalitynet.org, travelandtourworld.com -->
| Off-grid solar and battery storage for a Phangan villa: real 2026 install costs (THB/kWp) and payback versus the PEA grid-tied feed-in scheme, for owners who actually need outage independence | costs | 🟢 | ⏳ |
| What a Phangan property lawyer's fee actually buys: due-diligence, conveyancing and title-search costs (THB 30,000-120,000) broken down against what each stage covers | process | 🟢 | ⏳ |
| Minor Hotels' Avani and the KAIA tented resort opening on Phangan in 2026: what an international brand's first move onto the island signals for buyers weighing Thong Nai Pan and comparable areas | phangan | 🟡 | ⏳ |

## C. Per-district guides (~18 districts in districts.ts)

| Topic | faqCategory | Priority | Status |
|---|---|---|---|
| Buying in Sri Thanu: who it suits, prices, property types | phangan | 🟢 | ✅ |
| Buying in Thong Sala: the island hub, liquidity | phangan | 🟢 | ✅ |
| Buying in Chaloklum: northern fishing village | phangan | 🟡 | ✅ |
| Buying in Haad Yao / Haad Salad | phangan | 🟡 | ✅ |
| Buying in Ban Tai / Ban Khai (south, sunsets) | phangan | 🟡 | ✅ |
| Buying in Thong Nai Pan (premium north-east bays) | phangan | 🟡 | ✅ |
| Buying in Madeau Wan: quiet inland residential district | phangan | 🟡 | ✅ |
| Buying in Haad Rin: Full Moon Party peninsula, investor guide | phangan | 🟡 | ✅ |
| Buying in Wok Tum: quiet sunset strip near Thong Sala | phangan | 🟡 | ✅ |
| Buying in Hin Kong: long west-coast beach, families | phangan | 🟡 | ✅ |
| Buying in Mae Haad: Koh Ma sandbar and snorkelling north-west | phangan | 🟡 | ✅ |
| Buying in Bottle Beach (Haad Khuat): remote off-grid north | phangan | ⚪️ | ✅ |
| Buying in Than Sadet: national park jungle and river | phangan | ⚪️ | ✅ |
| Buying in Haad Yuan / Haad Tien: secluded south-east wellness coves | phangan | ⚪️ | ✅ |
| Buying in Khao Khao Haeng: panoramic inland hilltop views | phangan | ⚪️ | ✅ |
| Buying in Ban Nai Suan: central inland, space and value | phangan | ⚪️ | ✅ |

## D. Comparisons / decision guides

| Topic | faqCategory | Priority | Status |
|---|---|---|---|
| Phangan vs Samui vs Tao for investment: an honest comparison | costs | 🟡 | ✅ |
| Land vs finished villa vs off-plan: choosing by goal | process | 🟡 | ✅ |
| Freehold condo vs leasehold villa for a foreigner | ownership | 🟡 | ✅ |
