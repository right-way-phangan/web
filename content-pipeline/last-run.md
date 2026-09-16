# Last run — 2026-09-16

Published 2 guides (EN + RU each). The backlog's remaining ⏳ rows are all long-stalled watch items (Koh Phangan water crisis, FBA/AMLA predicate-offence amendment, coalition "review foreign ownership" pledge, rental-yield/power-grid/stamp-duty-vs-SBT/off-plan-vetting angles) — each already re-checked and re-confirmed duplicate/thin/unsafe across 10+ prior runs, with no change found this run. A fresh-news sweep and an evergreen-gap-mining pass (two parallel research agents) were run instead, consistent with how this pipeline has handled an exhausted backlog before.

## 1. kb-0177 — `pdpa-personal-data-protection-villa-rental-thailand`
- **Title:** Villa rental guest data and Thailand's PDPA: what a Koh Phangan owner must do beyond TM30
- **faqCategory:** process
- **Sources:**
  - Tilleke & Gibbins — "Landmark Fine Imposed under Thailand's Personal Data Protection Act" — direct fetch; Nov 2024 ฿7M PDPC fine (missing DPO, inadequate breach security, missed 72-hour notification).
  - Tilleke & Gibbins — "Thailand: Operationalising PDPA (Lawful Basis, Sensitive Personal Data, Data Processing Safeguards)" — direct fetch; lawful-basis framework (consent/contract/legal obligation).
  - CMS Law — "Thailand Provides Clarity on When a DPO Must Be Appointed" — direct fetch; explicitly analyses a small rental operation and concludes a DPO is very unlikely required (100,000+ data subject threshold, or systematic core-activity monitoring).
  - Securiti — "Thailand Personal Data Protection Act (PDPA): Ultimate Guide" — direct fetch; Section 4 household-exemption text, lawful bases, DPO triggers.
  - belaws — "What Are the Penalties for Breaching the PDPA?" — direct fetch; the ~฿1m/3m/5m administrative fine tiers by violation type.
  - Section 26 sensitive-data definition (race/health/biometric/criminal record etc.) cross-checked via search-result corroboration of the PDPC's own bilingual statute-text site (direct fetch returned 403, so used as a secondary corroboration only, not a standalone citation).

**Why it's distinct:** Grepped the full 176-slug catalog for "PDPA," "personal data," and related terms — zero hits. The closest guides — `tm30-foreign-guest-notification-koh-phangan` (the immigration reporting duty itself), `short-term-rental-airbnb-crackdown-2026` (Hotel Act licensing) and `renting-out-your-villa-rules-and-taxes` — were read in full and confirmed to never mention data-protection law. The guide's distinct contribution: TM30's "legal obligation" lawful basis covers only that specific report, not other uses of the same guest data (CCTV, marketing, platform sharing beyond the booking itself), which is the gap no existing guide addresses.

**Framed conservatively:** explicitly notes an ordinary passport copy is *not* automatically "sensitive personal data" (only biometric extraction — e.g. facial-recognition check-in — crosses that line), and that a DPO is very unlikely required for a single villa or small operation, rather than overstating compliance burden in either direction.

## 2. kb-0178 — `guest-injury-liability-public-liability-insurance-thailand`
- **Title:** If a guest is hurt at your Koh Phangan villa: Civil Code possessor liability, and why "home insurance" often doesn't cover it
- **faqCategory:** costs
- **Sources:**
  - ThailandLawOnline — "420-452 Thai law on Wrongful Acts" — direct fetch; quoted Sections 434, 435, 436 verbatim.
  - Thailand Law Library (Siam Legal) — "Civil and Commercial Code: Torts (Section 420-437)" — cross-check via search-result corroboration (direct fetch returned 403); consistent text on Sections 434-437.
  - MSIG Thailand — "Public Liability Insurance" — direct fetch; product scope (third-party bodily injury/property damage, legal defence costs, exclusions).
  - Mr Property Siam — "Villa Insurance in Thailand: What Owners Actually Need" — direct fetch; ฿10-20M recommended cover levels, ฿35,000-90,000/year realistic combined premiums, cited poolside-incident claim examples.

**Why it's distinct:** Read `insuring-a-villa-koh-phangan-flood-storm-coverage` (kb-0065) in full — it covers only first-party fire/flood/storm cover and explicitly never addresses third-party liability or the CCC possessor-liability provisions; its own "where flood cover falls short" section doesn't touch public liability at all. Grepped the catalog for "occupier liability," "434," "436," "public liability" — zero hits.

**Framed conservatively:** deliberately did not assert that Section 437's stricter dangerous-things track applies to specific rental-property equipment (pool machinery, generators, gas systems) — no reported case law confirming that boundary was found, so the guide flags it as untested rather than assuming Section 434's lighter "proper care" defence carries over.

## Process notes

Two parallel research agents ran: a fresh-news sweep (2026-09-10/16 window) found nothing beyond incremental stat updates to the already-heavily-covered nominee-crackdown cluster (an AMLO 81.77%-drop/฿20.39bn-frozen refresh, a Laem Son Beach TV-probe follow-up) — both ruled non-distinct. An evergreen-gap-mining pass over the full 176-slug catalog surfaced three candidates (PDPA, occupier/public-liability, and Foreign Currency Deposit accounts for managing purchase/sale funds); the first two were independently verified against primary/law-firm sources and published, and are the most distinct from each other and from the existing catalog. The FCD-account topic is a solid candidate for a future run, not added as a backlog row since it wasn't a pre-existing ⏳ item.

`content-pipeline/backlog.md` updated: a discovery note logged at the top of section A documenting both topics, their sourcing, and why no new backlog row was added (neither was a pre-existing ⏳ item, consistent with this file's established convention).

TypeScript typecheck (`npx tsc --noEmit -p .`) run clean against both content files. Verified no duplicate slugs/kbIds and full EN/RU slug parity (177 matching entries each) before finishing. Verified every internal `/knowledge/<slug>` cross-link added in both new guides resolves to a real, existing slug.
