# Last run — 2026-09-17

Published 2 guides (EN + RU each). The backlog's remaining ⏳ rows are all long-stalled watch items (Koh Phangan water crisis, FBA/AMLA predicate-offence amendment, coalition "review foreign ownership" pledge, rental-yield/power-grid/stamp-duty-vs-SBT/off-plan-vetting angles) — each re-checked and re-confirmed duplicate/thin/unsafe again this run. A fresh-news sweep and an evergreen-gap-mining pass (two parallel research agents) ran first; both came back empty or already-covered, so the two guides below came from a targeted manual follow-up search instead.

## 1. kb-0179 — `thai-reit-indirect-real-estate-investment`
- **Title:** Thai REITs: indirect exposure to Thai real estate that never touches the Land Code
- **faqCategory:** ownership
- **Sources:**
  - The Stock Exchange of Thailand (SET) — REIT listing framework page — direct fetch; 75% NAV-in-real-estate rule, 90% net-profit distribution requirement, 35%/60% gearing caps, REIT Manager (SEC-approved) + trustee (SEC-licensed) requirement, 250-unitholder/20%-minority-float rule.
  - Tilleke & Gibbins — "REIT: A New Tool for Real Estate Investment and Fund Generation in Thailand" — direct fetch; SEC approved the REIT framework in 2010, replacing the older Property Fund for Public Offering model.
  - SET — Frasers Property Thailand Industrial Freehold & Leasehold REIT (FTREIT) factsheet — direct fetch; a real, currently-listed REIT stating a 49.00% foreign-ownership limit, used as concrete evidence for the freehold-REIT foreign-unitholding cap.
  - PwC Thailand Tax Summaries — corporate income determination — search-corroborated; 10% flat withholding tax on dividend/REIT distributions to non-residents, reducible under double-tax treaties.

**Why it's distinct:** Grepped the full 177-slug catalog for "REIT" — found only two passing mentions (an eligible-asset-class bullet inside the ฿40M investment-route guide, and a one-sentence carve-out inside the offshore-family-trust guide's Trust for Transactions in Capital Market Act reference). Neither gives REITs dedicated treatment as their own investment route. This guide positions REITs as a third, genuinely distinct example (alongside the 40M route and BOI-promoted land ownership, both cross-linked) of Thai law already allowing indirect/scaled foreign real-estate exposure beyond the 49% land-ownership ban — while being explicit that it's a securities instrument concentrated in Bangkok/major-hub commercial assets, not a Phangan-villa substitute.

**Framed conservatively:** did not assert an exact count of listed Thai REITs (search-derived counts were inconsistent) and described the SEC gearing-limit rule in substance without pinning it to an unverified notification number I couldn't independently confirm via primary fetch.

## 2. kb-0180 — `non-resident-baht-account-nrba-property-thailand`
- **Title:** Non-Resident Baht Accounts (NRBA): the banking classification most Phangan buyers are in without realising it
- **faqCategory:** process
- **Sources:**
  - Bank of Thailand — Exchange Control Regulation page — direct fetch; NRBA (general purposes incl. explicitly "investment in immovable assets") vs. NRBS (securities only) definitions, straight from BOT's own site.
  - Bank of Thailand — Measures to Prevent Thai Baht Speculation page — direct fetch; confirmed the ฿200 million aggregate end-of-day balance cap (across all NRBA+NRBS accounts, all Thai banks combined) is still current, plus BOT Circular 5491/2568 (1 Sep 2025, effective 1 Dec 2025) refinements — interest-payment restriction, ฿200M non-resident baht-lending cap, ฿10M borrowing cap without underlying trade/investment.
  - Tilleke & Gibbins — "Banking in Thailand: Resident or Non-resident Account?" — direct fetch; confirmed the resident/non-resident test for banking purposes turns on holding a permanent residence permit or valid Thai work permit — a wholly separate test from the 180-day tax-residency rule already covered elsewhere on the site.
  - Conventus Law — "Non-Resident Baht Accounts Daily Limit Reduced to Baht 200 Million" — search-corroborated; confirmed the cap was cut from ฿300M to ฿200M effective 22 July 2019.

**Why it's distinct:** Full-text grep for "NRBA," "non-resident baht account" and "NRBS" returned zero hits across the existing catalog. Read `bringing-money-into-thailand-fet-form` and `thai-bank-account-foreign-property-buyer-2026` in full to confirm neither covers this: the FET-form guide covers the one-off certificate issued at the moment of inbound conversion, and the bank-account guide covers visa-based eligibility to open an account at all — neither addresses the ongoing NRBA/NRBS account classification, its balance cap, or the (genuinely useful, previously unstated) fact that most Phangan buyers remain banking "non-residents" indefinitely regardless of actual years lived on the island.

**Framed conservatively:** explicitly scoped the practical relevance honestly — flagged the ฿200M cap as unlikely to bind a single villa purchase, relevant mainly to company sales, large inheritances or consolidated proceeds awaiting reinvestment, rather than overstating its everyday relevance.

## Process notes

Two parallel research agents ran first: a fresh-news sweep (2026-09-14/17 window) found nothing beyond the already-published 60→30-day visa exemption change (kb-0137) and re-confirmed all standing watch items unchanged. An evergreen-gap-mining pass surfaced three candidates (Land Development Act juristic-person/fee mechanics, CCC 587-607 hire-of-work defect liability, FET-form-for-condo-registration mechanics) that were all independently verified to already be covered — by kb-0141, by an existing cross-reference inside kb-0140, and by the existing FET-form guide family respectively. A manual follow-up search then found and verified a promising-looking BOT Dec-2025 documentation circular (8434/2568, USD 200,000+ inflows), which turned out to already be covered inside the crypto-to-fiat property-purchase guide. Two genuinely fresh, well-sourced, narrow financial/banking-mechanics gaps (Thai REITs, and Non-Resident Baht Accounts) were found and published instead — both verified against primary sources (SET's own listing page, BOT's own regulation pages) plus independent law-firm corroboration, and both confirmed via full-catalog grep to have no prior dedicated coverage.

`content-pipeline/backlog.md` updated: a discovery note logged at the top of section A documenting today's news-sweep/gap-mining findings, the four rejected-as-already-covered candidates, and the two published topics with sourcing — consistent with this file's established convention (neither topic was a pre-existing ⏳ backlog row, so no row needed marking).

TypeScript typecheck (`npx tsc --noEmit -p .`) run clean against both content files. Verified no duplicate slugs/kbIds and full EN/RU slug parity (179 matching entries each, up from 177) before finishing. Verified every internal `/knowledge/<slug>` cross-link added in both new guides resolves to a real, existing slug.
