# Last run — 2026-09-17 (second run, same day)

Today's first run already published 2 guides (kb-0179 Thai REITs, kb-0180 Non-Resident Baht Accounts). This second invocation needed genuinely new ground. Two parallel research agents ran first: one fresh-news sweep (2026-09-14/17 window), one evergreen-gap-mining pass over the full 179-slug catalog. Both are logged in detail in `content-pipeline/backlog.md`'s discovery note. Published 2 more guides (EN + RU each) below.

## 1. kb-0181 — `damrongtham-center-land-property-complaints-thailand`
- **Title:** The Damrongtham Center: Thailand's free administrative complaint channel for land and permit problems
- **faqCategory:** process
- **Sources:**
  - Tilleke & Gibbins — "Legal Options for Addressing Challenges with Land Matters in Thailand" — direct fetch; situates the Damrongtham Center among Thailand's non-judicial land-dispute remedies (in-person/post/hotline/app/online channels), alongside direct Land Department complaints and the judicial routes (civil claims, administrative liability, criminal proceedings).
  - The Phuket News — "How to complain in English?" — direct fetch; practical filing guide (1567 hotline, in-person/mail/website, passport + Thailand address required, ~15-day informal resolution target, foreigner access with a Thai-translation caveat, Phuket Provincial Hall office hours).
  - Bangkok Post — "Villagers protest against Damrongtham Centre" — search-corroborated; a real land/municipal dispute case illustrating the Center's practical role (and limits).
  - General 1994-origin / 2014 nationwide-reorganisation history and the hotline/seven-function framework corroborated via multiple search results (Google Play app listing, provincial Damrongtham sites, Nation Thailand's 1567-hotline piece) rather than a single pinned primary instrument — described in the guide at that general level of confidence rather than citing an unverified exact order number.

**Why it's distinct:** Grepped the full 179-slug catalog for "damrongtham" and "1567" — zero hits. The existing dispute-resolution cluster (consumer-case-procedure-act-buyer-developer-disputes, arbitration-clause-thai-property-lease-disputes, court-injunction-freeze-disputed-property-thailand, land-code-section-83-caveat-title-deed) covers only judicial or quasi-judicial routes; the Damrongtham Center is a distinct, non-judicial, executive-branch administrative complaint channel, and is directly relevant given Koh Phangan's history of forged permits and disputed land-disposal orders, where owners often need a way to escalate before or instead of suing.

**Framed conservatively:** explicit that it has no power itself to cancel a title, freeze a sale, or award compensation; the 15-day figure is presented as an informal target, not a statutory deadline; did not pin the 2014 reorganisation to a specific unverified order number.

## 2. kb-0182 — `gift-of-land-ccc-formality-revocation-thailand`
- **Title:** Gifting a villa, land or leasehold in Thailand: the writing-and-registration rule, and when it can be undone
- **faqCategory:** documents
- **Sources:**
  - ThailandLawOnline — "Civil and Commercial Code Sections 521-536: Gift is a Contract" — direct fetch; Sections 525, 531, 533, 535 quoted directly.
  - Silk Legal — "Goodbye, honey; and thanks for the house!" – The law on gifts in Thailand — direct fetch; independently corroborates the Section 531 ingratitude grounds and Section 533 deadlines.
  - Thailand Law Forum — "Thailand Civil and Commercial Code Sections 518-571" — direct fetch; a third independent mirror consistent with the other two on Sections 521, 523, 525, 528, 531, 533, 535.

**Why it's distinct:** Grepped the full 179-slug catalog for "gift", "525", "531" (excluding "gift tax" hits) — the only existing coverage is kb-0129 (gift-tax-property-transfers-family-thailand), which is entirely about Revenue Code income-tax exemptions and the Land Office transfer-fee discount on a gift already properly made. It never addresses the underlying civil-law question of what makes a gift of immovable property legally valid in the first place (Section 525's writing-and-registration formality, mirroring Section 456's sale formality) or when a completed gift can later be revoked (Section 531's narrow ingratitude grounds). Confirmed via full read of kb-0129 that neither topic is mentioned there — genuinely distinct, cross-linked in both directions.

**Framed conservatively:** did not assert that revoking a registered gift is straightforward — explicitly stated it requires a court judgment before the Land Office will amend the title, and that courts read the Section 531 grounds narrowly, consistent with the site's practice elsewhere of not overstating how easily a completed registration can be undone.

## Process notes

Two parallel research agents ran first. The fresh-news sweep (2026-09-14/17 window) found nothing genuinely new — re-confirmed all four standing watch items unchanged and ruled out one incremental nominee-crackdown stats/deadline update (Thai Examiner, 16 Sep 2026) as non-distinct from 10+ already-published guides. The evergreen gap-mining pass proposed six candidates; two were dropped after independent verification by the author: the sin-suan-tua/Thai-spouse land-purchase declaration (already covered in depth inside `foreign-spouse-usufruct-thai-marriage-property`, confirmed via grep — a false positive the agent's slug-only dedup check missed) and title insurance (too thin — the one cited provider's page returned HTTP 403, and broader search found no substantive Thailand-specific coverage or cost detail). The two published topics (Damrongtham Center, CCC gift-of-land formality/revocation) were both independently re-verified by the author via direct WebFetch of primary/law-firm sources before writing, and confirmed via full-catalog grep and full reads of the closest-matching existing guides to have no prior dedicated coverage.

`content-pipeline/backlog.md` updated: a discovery note logged at the top of section A documenting this run's news-sweep/gap-mining findings, the two rejected-as-already-covered/too-thin candidates, and the two published topics with sourcing (neither topic was a pre-existing ⏳ backlog row, so no row needed marking).

TypeScript typecheck (`npx tsc --noEmit -p .`) run clean against both content files. Verified no duplicate slugs/kbIds and full EN/RU slug parity (181 matching entries each, up from 179) before finishing. Verified every internal `/knowledge/<slug>` cross-link added in both new guides resolves to a real, existing slug.
