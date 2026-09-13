# Last run — 2026-09-13 (third run, same day)

Published 2 guides (EN + RU each). This was the third content-pipeline invocation today: the first run already published kb-0167/kb-0168, and a same-day 6-agent weekly topic-scout found zero new topics against the by-then 169-slug catalog. This run needed genuinely new ground on an already heavily-mined day.

## 1. kb-0169 — `crs-fatca-bank-account-reporting-thailand`
- **Title:** CRS and FATCA: does opening a Thai bank account to buy on Koh Phangan get reported to your home tax authority?
- **faqCategory:** costs
- **Sources:**
  - Revenue Department of Thailand — Guidance on Common Reporting Standard (CRS), updated 18 August 2023 (primary/official; verified by downloading the 67-page PDF directly and extracting text with pypdf after WebFetch's own PDF-to-markdown conversion garbled key figures — confirmed the 16 Aug 2023 new-account self-certification cutoff, the THB 30,000,000 pre-existing-individual and THB 7,500,000 pre-existing-entity thresholds, the MCAA CRS signing timeline (cabinet approval 18 May 2021, MOF signature 28 Mar 2022, first exchange by end Sept 2023), and — a genuinely useful find not mentioned in any secondary source checked — that a genuine escrow/earnest-money account is listed as a CRS-Excluded Account under the Department's own Appendix A(e)).
  - Sherrings — Common Reporting Standard (CRS): Tax Laws Thailand (independent corroboration of the threshold figures).
  - US Department of the Treasury — Thailand FATCA Model 1 Intergovernmental Agreement (4 March 2016 signing date, corroborated via search-result summaries after the PDF itself proved unextractable).
  - OECD — statement confirming Russia's automatic-exchange participation was provisionally suspended in September 2022 (used only for a conservative caveat that the reportable-jurisdiction list changes, not to claim a specific country's current status).

## 2. kb-0170 — `landsmaps-online-title-deed-verification-thailand`
- **Title:** LandsMaps: the Land Department's free online tool to check a Koh Phangan plot's real boundaries before you even view it
- **faqCategory:** documents
- **Sources:**
  - Department of Lands (Trat provincial office, dol.go.th) — official LandsMaps announcement (primary/official; direct fetch).
  - LandProThailand — How to Use LandsMaps to Search for Land in Thailand (practitioner walkthrough).
  - LAD.co.th — วิธีเช็คที่ดินผ่าน LandsMaps (Thai-language practitioner guide, direct fetch; corroborated the free/24-hour, no-deed-number landmark-search and official "not complete legal information" caveat).

## Process notes

Two research agents ran in parallel first:
1. **Fresh-news sweep** (2026-09-06/13 window), explicitly briefed to try narrower sub-angles since this morning's runs had already exhausted the broad nominee-crackdown/water-crisis/coalition-stance searches. Found nothing new — confirmed via direct fetch that the one lead flagged as unverified in this morning's discovery-run note ("government shelves the 99-year leasehold bill") is actually dated 16 September **2025**, a year stale, not a live 2026 development.
2. **Evergreen gap-mining** over four specific untried angles (verified via grep that none of CRS, FATCA, PDPA, marina/vessel, or LandsMaps/SmartLands appeared anywhere in the 169-slug catalog): CRS/FATCA bank-account reporting (**VIABLE**, published), Land Department digital services beyond the already-published D-Value guide (**VIABLE** via LandsMaps, published), marina/vessel ownership (**NOT RELEVANT** — no Phangan marina infrastructure, not a property-law question), and PDPA data protection for real-estate transactions (**TOO THIN** — no sector-specific primary or reputable sourcing found beyond generic marketing pages).

Both published guides were independently re-verified by the author via direct primary-source fetches before writing (not just reused from the research agents' summaries) and confirmed distinct from the closest existing guides by reading them in full: `amlo-anti-money-laundering-checks-real-estate-agents`, `bringing-money-into-thailand-fet-form`, `thai-bank-account-foreign-property-buyer-2026` for kb-0169; `due-diligence-checklist-koh-phangan`, `d-value-check-official-appraised-value-online`, `untitled-sea-view-land-pbt5-sor-por-kor-scam` for kb-0170.

`content-pipeline/backlog.md` updated: two new rows added and marked ✅ for the two published topics, with a discovery note logged inline explaining the third-run search and the PDPA/marina angles ruled out.

TypeScript typecheck (`npx tsc --noEmit`) run clean against both content files before finishing.
