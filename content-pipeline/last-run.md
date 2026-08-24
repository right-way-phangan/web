# Last run — 2026-08-24

**Guides published:** 2 (of 2 targeted)

Picked the top two undone 🔴 news-tier rows from `content-pipeline/backlog.md` section A
(both discovered 2026-08-23, both untouched by any prior skip note), confirmed neither slug
already existed in `src/content/knowledge-base.ts`, and grounded each against multiple
independent live sources before writing.

---

## Guide 1

- **slug:** `21-agency-anti-nominee-mou-2026`
- **kbId:** `kb-0103`
- **title (EN):** The 21-agency anti-nominee pact: what Thailand's April 2026 data-sharing MOU changes for company-held property
- **title (RU):** Пакт 21 ведомства против номинального владения: что меняет апрельское соглашение об обмене данными 2026 года для недвижимости через компанию
- **faqCategory:** `structures`
- **faqQuestion:** What is Thailand's 21-agency anti-nominee MOU signed in April 2026, and does it change the rules for a 49/51 company structure?
- **Sources used:**
  - The Online Citizen — "Thailand cuts high-risk nominee firms by 75% ahead of 21-agency anti-fraud pact" (27 Apr 2026) — signing date, 21 agencies, PM Anutin chairing, Santi Maitri Building venue, the 75% (658→175) statistic
  - Bangkok Post — "'High-risk' business registrations plunge" — independent corroboration of the same statistic (headline/byline confirmed via search; full-text fetch was blocked by a paywall redirect, so only the corroborating headline was relied on, not quoted content)
  - Pattaya Mail — "Thailand escalates legal crackdown with agency alliance targeting illegal 'nominee' structures" (verified via direct fetch, 8 May 2026) — the operational mechanism: corporate/land-registry data sync, immigration-visa cross-checking, financial-intelligence tracing; named DBD/DOL/Immigration/Revenue/AMLO as signatories, corroborating the agency list

This is a genuinely distinct escalation, not a rehash of the DBD-Land Department link already
covered in kb-0051 (land-department-audit-existing-landholding-companies-2026): the April pact
is a single, PM-chaired, 21-agency framework spanning immigration, customs, central banking and
tourism, not a two-agency data feed. The 75% drop-in-filings statistic is presented carefully as
a pre-signing deterrence indicator (the comparison window is 1–23 April, before the 29 April
signing), not a measured post-MOU result, since no post-signing figures could be found.

## Guide 2

- **slug:** `thb-3-million-investment-visa-non-immigrant-b-2026`
- **kbId:** `kb-0104`
- **title (EN):** The THB 3 million property investment visa: how the Non-Immigrant B route actually works in 2026
- **title (RU):** Инвестиционная виза за ฿3 миллиона: как на самом деле работает путь Non-Immigrant B в 2026 году
- **faqCategory:** `ownership`
- **faqQuestion:** How does Thailand's THB 3 million property investment visa actually work, and does it cover a Koh Phangan leasehold villa?
- **Sources used:**
  - Thai-Residence.com — "Thailand Investment Visa for 3 Million Baht: Facts, Myths, and What the Law Actually Says" — facts-vs-marketing framing, Orders 237/2568 & 238/2568, two-stage process, fee breakdown, LTR comparison
  - AIM Bangkok — "3M Property Visa Thailand (2026): Confirmed Rules & Process" — freehold-condo-only framing and process detail
  - Thai Law Online — "New 3 Million Baht Property Investment Visa in Thailand" — legal basis, two-stage process detail, Ministry of Tourism certification requirement
  - Formichella & Sritawat (fosrlaw.com) — "Thailand's 3 Million Baht Investment Visa: A Potential Long-Term Stay Pathway" — regulatory-uncertainty framing on non-condo routes

Distinct from the already-published kb-0028 (visa-residency-property-owner-koh-phangan), which
covers this visa in two summary paragraphs inside a broader 4-option visa overview. This guide
is the dedicated deep-dive: specific order numbers, the exact two-stage process and 2026
renewal milestone, the mandatory Ministry of Tourism certification step, a full fee breakdown,
and a structured LTR comparison — none of which kb-0028 covers.

Sourcing on which property structures qualify (freehold condo only vs. freehold + leasehold +
Sap-Ing-Sith) was genuinely inconsistent across the law-firm/marketing sources checked, and a
WebSearch-synthesized claim that a leasehold "pause" had been "lifted" could not be verified
against a direct fetch of its origin page (aimbangkok.com returned empty content twice on
direct WebFetch). Per the conservative-legal-claims rule, the guide does not assert the pause
was lifted — it states freehold condo as the only reliably-confirmed route and explicitly flags
leasehold/Sap-Ing-Sith/rental sub-routes as inconsistently reported, consistent with this site's
own kb-0028 (June 2026), which stated the leasehold/rental route was suspended.

---

`npx tsc --noEmit` passes clean on both content files. kbId sequence continues at kb-0105
(this run used kb-0103 and kb-0104; prior max was kb-0102).
