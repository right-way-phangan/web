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
<!-- discovered 2026-08-16, sources: aimbangkok.com, thailawonline.com, lexology.com, houseviser.com, lexbangkok.com, dansiam-property.com, nishimura.com, nationthailand.com, siam-legal.com, bighousekeeper.com -->
| DBD's 2026 in-person shareholder verification (from 1 April 2026, Orders 1/2569 and 2/2569) plus real-time bank-statement/land-registry cross-checking for *amending* an existing Thai property-holding company (adding directors, changing shareholding, capital increases) — the compliance step every 49/51 structure eventually hits, distinct from the initial-incorporation source-of-funds rules already covered | structures | 🔴 | ✅ |
<!-- 2026-08-16: published as kb-0094 (dbd-order-2-2569-consolidated-rules-2026), but corrected against primary/law-firm sourcing rather than published as originally framed. The "in-person verification, Orders 1/2569 and 2/2569" premise doesn't hold up: Order 1/2569 (1 Apr 2026, enacted) requires only a written Investment Confirmation Letter, no appearance — the in-person/sworn-statement mechanism was a draft proposal (public consultation 29 Feb-13 Mar 2026) that did not survive into the enacted text. Order 2/2569 (1 Aug 2026, newly discovered this run, not previously covered) is the real fresh news: it repeals and consolidates Order 2/2568 (Jan 2026, incorporation) and Order 1/2569 (Apr 2026, amendments) into one filing standard (bank statements + receiving-account statements + Investment Explanation Letter) covering both incorporation and amendments. In-person appearance under current rules is real but narrow — only for an AMLO watchlist match (Order 3/2568) or a State Welfare Card holder flagged as director/major shareholder (Order 5/2568), both Jan 2026, unrelated to the general 49/51 documentation track. No land-registry cross-checking requirement was found in any primary/law-firm source for this order. -->
| 2026 (B.E. 2569) Land and Building Tax: for the first time since the 2020 restructuring, no reduction decree has been issued — owners pay full statutory rates, with assessment/payment deadlines pushed to June-July and a 3-installment option for bills over ฿3,000 | costs | 🔴 | ⏳ |
<!-- 2026-08-16: skipped — substantially duplicates the already-published kb-0027 (owners-taxes-annual-land-and-income), which already states 2026 is "the first full-rate year without a pandemic-era across-the-board government discount," gives the full rate table by property category, and covers the deadline extension to June 2026 and the installment option for bills ≥฿3,000. Left ⏳; a future run could revisit narrowly only with a genuinely distinct angle not already covered by kb-0027 or the separately published disputing-land-building-tax-assessment guide. -->
| Foreign Business Act amendment under public consultation (closed April 2026): proposal to make nominee shareholding a money-laundering predicate offence under Thai AML law, not just an FBA violation — a materially higher risk tier if enacted (watch-item; not yet law, sourcing thinner than usual — verify before publishing) | structures | 🟡 | ⏳ |
<!-- discovered 2026-08-09, sources: lexology.com, fosrlaw.com, rentaltaxthailand.com, rumavi.com -->
| Short-term rental (Airbnb) 2026 enforcement crackdown: cross-agency data-sharing (Revenue Dept/Immigration/Interior) and automated platform scanning against unlicensed daily/weekly lets under the Hotel Act, plus a draft bill that would let condos legally offer short-term rentals via simple registration instead of a hotel licence | process | 🔴 | ✅ |
<!-- discovered 2026-08-02, sources: nationthailand.com, bangkokpost.com, thailand-real.estate, matching-property.com, aimbangkok.com -->
| Why the 0.01% transfer/mortgage registration fee discount (extended to 30 June 2027, ≤7M THB) does NOT apply to foreign buyers — what a foreigner actually pays vs. a Thai co-owner or spouse on title | costs | 🔴 | ✅ |
<!-- 2026-08-03: skipped — substantially duplicates the already-published kb-0051 (land-department-audit-existing-landholding-companies-2026), which already covers the same May 2026 circulars, monthly review, quarterly reporting and Section 97/98 thresholds. Left ⏳; a future run could revisit narrowly on the Surat Thani-specific company counts if a genuinely new angle emerges. -->
<!-- 2026-08-15: checked again with the Surat Thani-specific angle explicitly in mind. Found genuinely new granular data (Koh Phangan: 4,761 registered companies, 3,213 foreign-linked/67.48%, nationality breakdown led by Israel/France/UK; the May 13 and May 23 2026 two-phase raid with named case examples), but the general "flagged companies + raid" narrative is already threaded through 5+ published guides (kb-0013 Krabi, kb-0051 audit framework, kb-0061 buying a company-held villa incl. the 68%/11,426 combined-island figure and a July 2026 raid, kb-0063 Section 94, plus a passing mention of the same May raid figures in kb-0050-ish forest-reserve guide). A 6th guide built on the same underlying raid would read as repetition despite new numbers, and naming specific businesses under active investigation (as the freshest sources do) adds accuracy/reputational risk given inconsistent figures across outlets (฿150M vs ฿152M, 37 vs 45 plots). Skipped on quality grounds; left ⏳ for a future run only if a materially different angle (not another raid recap) emerges. Also checked same-day news (2026-08-14 Thai Examiner: hotels' international booking-platform data used as raid evidence) — overlaps the already-published kb-0087 (short-term-rental-airbnb-crackdown-2026, which already covers platform-data cross-checking) and the same nominee-crackdown cluster; not published. -->
| Land Department's new 8-province corporate landholder monitoring database (Surat Thani named a priority province): monthly foreign-shareholder checks and quarterly reporting to the DOL — what it means beyond the general nominee crackdown | structures | 🔴 | ⏳ |
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
| New OCPB residential leasing rules for landlords renting 3+ units: deposit caps and contract requirements | costs | 🟡 | ✅ |
| Water supply and shortage risk on Koh Phangan: what it means for a villa's operating costs | phangan | 🟡 | ✅ |
| New villa and residential development pipeline 2025-2026: named projects and what they signal | phangan | 🟡 | ✅ |
| Healthcare and schools access for buyers relocating with family | phangan | 🟢 | ✅ |
<!-- 2026-08-04: skipped — substantially duplicates the already-published kb-0010 (renting-out-your-villa-rules-and-taxes), whose title and body already frame realistic yield as median rate × occupancy minus real costs, vs. brochure projections. Left ⏳; no distinct angle identified. -->
| Realistic villa rental yields: what actually drives returns beyond the headline percentage | costs | 🟡 | ⏳ |
<!-- discovered 2026-07-05, sources: aseanbriefing.com, houseviser.com, thaienquirer.com (search snippets), thethaiger.com, centreforaviation.com, thailand-construction.com -->
| The THB 40 million investment route: how a foreigner can legally hold up to 1,600 sqm of land in their own name | structures | 🟢 | ✅ |
| Untitled "sea-view land" scams: why cheap PBT5/Sor Por Kor plots overlapping national park or forest reserve boundaries can never get a chanote | documents | 🟢 | ✅ |
| Insuring a villa on Koh Phangan: what flood and storm coverage actually costs, and where standard policies fall short | costs | 🟢 | ✅ |
| The right of habitation: Thailand's overlooked fourth registered property right (and when it beats usufruct) | structures | ⚪️ | ✅ |
| Is a Koh Phangan airport actually coming? The abandoned Kan Air/national-park dispute and what it means for buyers today | phangan | ⚪️ | ✅ |
<!-- discovered 2026-07-12, sources: srpplaw.com, lexology.com, oceanwwp.com, bakermckenzie.com, libothai.com, khaosodenglish.com, malaymail.com, dda-realestate.com -->
| Selling a Thai company that holds your villa: is a share-sale really a tax shortcut versus a land transfer, and where does the Revenue Department draw the line? | structures | 🟢 | ✅ |
| Disputing your Land and Building Tax bill: the assessment appeal process, deadlines and evidence needed | costs | 🟡 | ✅ |
| Buying next to undeveloped land: how to check what can legally be built beside your plot before you commit | process | 🟡 | ✅ |
<!-- discovered 2026-07-19, sources: propertyscout.co.th, phuketrealtor.com, archi-studio.asia, re.sukhothaiinterlaw.com, fosrlaw.com, kinnara.asia, islanders-properties.com, samuiforsale.com -->
| Withholding tax on a property sale: how the individual-seller calculation (years-owned deduction, progressive rates) differs from a company's flat 1% | costs | 🟢 | ✅ |
| Coastal setback rules in practice: exact height, floor-area and open-space limits by distance-from-beach zone | structures | 🟢 | ✅ |
| Hillside building limits in practice: the altitude and slope-percentage tiers that decide what you can actually build | structures | 🟢 | ✅ |
| The LTR visa's property-investment route: how a USD 500k+ real estate purchase unlocks 10-year residency and tax perks | ownership | 🟢 | ✅ |
| Managing a rental villa remotely: how to vet a property-management company (fees, contracts, red flags) | process | 🟢 | ✅ |
| Specific Business Tax's 5-year exemption: how the clock is counted and which transfers qualify | costs | 🟡 | ✅ |
| Protecting a foreign spouse's interest in property bought during a Thai marriage: usufruct and superficies in practice | structures | 🟡 | ✅ |
<!-- discovered 2026-07-26, sources: solarpanelsthailand.com, solar-phangan.com, thailawonline.com, hospitalitynet.org, travelandtourworld.com -->
| Off-grid solar and battery storage for a Phangan villa: real 2026 install costs (THB/kWp) and payback versus the PEA grid-tied feed-in scheme, for owners who actually need outage independence | costs | 🟢 | ✅ |
| What a Phangan property lawyer's fee actually buys: due-diligence, conveyancing and title-search costs (THB 30,000-120,000) broken down against what each stage covers | process | 🟢 | ✅ |
| Minor Hotels' Avani and the KAIA tented resort opening on Phangan in 2026: what an international brand's first move onto the island signals for buyers weighing Thong Nai Pan and comparable areas | phangan | 🟡 | ✅ |
<!-- discovered 2026-08-02, sources: thailandlawonline.com, aimbangkok.com, wise.com, hlbthai.com, realting.com, canvas.solar, kohphangannews.org, libothai.com -->
| Sap-Ing-Sith ("right of use"): Thailand's lesser-known fifth registered property right under the 2019 Act — how it differs from usufruct, superficies and habitation, and why "30+30" marketing claims for it aren't legally binding either | structures | 🟢 | ✅ |
<!-- 2026-08-04: skipped — substantially duplicates the already-published kb-0027 (owners-taxes-annual-land-and-income), which already covers resident/non-resident treatment, the 30% deduction, progressive rates and the PND.90 filing deadline in depth. Left ⏳; a future run could revisit narrowly on the PND.94 mid-year filing angle if a genuinely new angle emerges. -->
| Non-resident vs. resident rental income tax: the flat 15% withholding on gross income vs. progressive rates (0-35%) with a 30% deduction — which status is cheaper, plus the PND.94/PND.90 filing deadlines owners miss | costs | 🟢 | ⏳ |
| Inheritance tax on Thai property: the 100-million-baht threshold, and why most villa owners' estates fall under it — 5% for direct heirs, 10% for others | costs | 🟢 | ✅ |
<!-- 2026-08-04: skipped — substantially overlaps the already-published kb-0026 (utilities-water-electricity-internet-koh-phangan), which already covers the submarine cable circuits, capacity and the EGAT/PEA upgrade project in its electricity section. Left ⏳; a future run could revisit narrowly on a Phangan-specific (vs. Samui-routed) cable angle if primary sourcing supports a genuinely distinct story. -->
| Koh Phangan's power grid reliability: the island runs on a single undersea cable from the mainland with no major upgrade expected before 2030 — what that outage risk means for a villa buyer's due diligence | phangan | 🟢 | ⏳ |
| 2027 land valuation reform: the Treasury Department's new Big Data appraisal cycle (2027-2030) aims to close the 20-40% gap between official and market land values — what it could do to land and building tax bills even with unchanged rates | costs | 🟡 | ✅ |
| Cruise ship pier proposal for Koh Samui/Phangan: tourism ministry talks to fix the lack of deep-water berthing (40+ ships/year currently tender passengers by small boat) — a real infrastructure story or another stalled plan? | phangan | 🟡 | ✅ |
<!-- 2026-08-14: skipped — the nationthailand.com "THB 7.9bn+" figure and the Israel/Europe/Australia buyer breakdown are the same Q1 2026 dataset already reported in depth in the already-published kb-0014 (koh-phangan-market-outlook-2026, "Who is buying and why" section). Left ⏳; a future run could revisit narrowly if a materially newer dataset (not the same Q1 2026 figures) emerges. -->
| Who's actually buying on Phangan in 2026: the Israeli, European and Australian buyer surge behind a reported THB 7.9bn+ in investment | phangan | 🟡 | ⏳ |
<!-- 2026-08-14: skipped — could not find a Phangan-specific primary source for the claimed "2018 Section 17 unfriendly-activities ban"; general searches (Enhancement and Conservation of National Environmental Quality Act 1992 s.17, Marine and Coastal Resources Management Act 2015 s.17) did not turn up a matching, citable provision, and no Phangan-specific enforcement reporting was found. Left ⏳; needs a lawyer-sourced or primary legal citation before this can be published accurately. -->
| Island wastewater and sewage rules: the 2018 Section 17 "unfriendly activities" ban on marine-harming discharge, and rising pressure to enforce it as Phangan's waste volume grows — what it means for septic/treatment planning on a new build | structures | 🟡 | ⏳ |
<!-- discovered 2026-08-09, sources: thailawonline.com, terms.law, dlapiperrealworld.com, oceanwwp.com, lordspropconsult.com, bangkokpost.com -->
| Foreign spouse/heir inheriting Thai land directly (not via leasehold): the Land Code Section 93-94 rule forcing disposal within 1 year, and why Ministerial permission to keep it is effectively unavailable | ownership | 🟢 | ✅ |
<!-- 2026-08-14: skipped — substantially duplicates the already-published kb-0084 (specific-business-tax-five-year-exemption-clock), which already states the mutual-exclusivity rule explicitly ("SBT and stamp duty are mutually exclusive on the same transfer — a sale never pays both") alongside the 0.5%/3.3% rates and the 5-year clock. Left ⏳; a future run could revisit narrowly only with a genuinely distinct angle (e.g. a worked multi-scenario example) not already covered. -->
| Stamp Duty vs Specific Business Tax: the mutual-exclusivity rule — when the 0.5% stamp duty applies instead of SBT, and why you never pay both | costs | 🟡 | ⏳ |
| VAT vs Specific Business Tax on new-build/developer sales: what a buyer actually pays, and why sources disagree — needs primary Revenue Department verification before publishing | costs | 🟡 | ✅ |
<!-- 2026-08-14: skipped — substantially overlaps the already-published kb-0009 (buying-off-plan-new-developments), which already covers developer track record, land title, permits, staged/milestone payments and contract review; could not independently verify the backlog's "154 projects, THB 61bn+" figure as a fresh number (it is the same Q1 2026 combined Samui+Phangan dataset already cited in kb-0014). Left ⏳; a future run could revisit narrowly by naming and vetting one specific live project, which kb-0009 deliberately does not do. -->
| Vetting a specific off-plan project on Samui-Phangan amid the 2026 development boom (154 projects, THB 61bn+ pipeline): developer track record, escrow accounts and construction-licence checks before you pay a deposit | process | 🟡 | ⏳ |
<!-- discovered 2026-08-16, sources: phuketbuyhouse.com, thailandcondoshop.com, thailawonline.com, islanders-properties.com, samui-phangan-real-estate.com, nationthailand.com -->
| Condo sinking fund and CAM (common-area maintenance) fees: the recurring ownership cost freehold condo buyers overlook, beyond the one-time transfer taxes already covered elsewhere | costs | 🟢 | ✅ |
| Why an offshore family trust can't hold Thai land: Thai law doesn't recognise private trusts domestically, so routing villa/land ownership through a home-country trust risks an unenforceable structure | structures | 🟡 | ⏳ |
| Price-per-area benchmark 2026: how Thong Sala, Sri Thanu and Haad Yao land/villa prices actually compare today, beyond the general price-per-rai explainer and the single-district guides | phangan | 🟢 | ⏳ |

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
