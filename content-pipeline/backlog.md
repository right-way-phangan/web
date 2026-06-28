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

## C. Per-district guides (~18 districts in districts.ts)

| Topic | faqCategory | Priority | Status |
|---|---|---|---|
| Buying in Sri Thanu: who it suits, prices, property types | phangan | 🟢 | ✅ |
| Buying in Thong Sala: the island hub, liquidity | phangan | 🟢 | ✅ |
| Buying in Chaloklum: northern fishing village | phangan | 🟡 | ✅ |
| Buying in Haad Yao / Haad Salad | phangan | 🟡 | ✅ |
| Buying in Ban Tai / Ban Khai (south, sunsets) | phangan | 🟡 | ✅ |
| Buying in Thong Nai Pan (premium north-east bays) | phangan | 🟡 | ✅ |

## D. Comparisons / decision guides

| Topic | faqCategory | Priority | Status |
|---|---|---|---|
| Phangan vs Samui vs Tao for investment: an honest comparison | costs | 🟡 | ✅ |
| Land vs finished villa vs off-plan: choosing by goal | process | 🟡 | ✅ |
| Freehold condo vs leasehold villa for a foreigner | ownership | 🟡 | ✅ |
