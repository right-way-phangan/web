# Content pipeline — last run

**Date:** 2026-09-27 (second run, same day — the first 2026-09-27 run already published kb-0204/kb-0205)

Backlog re-check: every other ⏳ row was already flagged duplicate/thin/unsafe by prior runs (water crisis stuck on PWA Notice 7/2569; LBT no-reduction-decree duplicates kb-0027; FBA/AMLA predicate-offence still Ombudsman/AMLO-review-only; realistic-rental-yields row duplicates kb-0010; power-grid single-cable duplicates kb-0026; "who's buying" surge duplicates kb-0014; stamp duty vs SBT duplicates kb-0084; off-plan project vetting declined on naming-a-specific-developer grounds; coalition stance and PND e-filing date both thin/stale) — not re-verified from scratch, carried forward. Two genuinely fresh/uncovered topics were picked instead: a brand-new 🔴 news row (discovered today, not yet checked) and the top non-duplicate 🟢 evergreen row.

## 1. kb-0206 — `nacc-anti-corruption-pinpoint-area-phangan-model-2026`

- **Title:** Koh Phangan named an NACC 'Anti-Corruption Pinpoint Area' for 2026: why officials, not just buyers, are now a target
- **faqCategory:** phangan
- **Sources:**
  - Khaosod English — Luxury Villa Investigation Uncovers 93 Violations on Koh Samui (officials named, 5-law scope, 3-month review cadence).
  - Nation Thailand — Koh Phangan land dispute raises questions over nominee businesses (Laem Son Beach: ~119 rai, 30+ years, unenforced court rulings).
  - ZoneSamui.com — 10 Jul 2026 French-language report: NACC Surat Thani accuses Koh Phangan local authorities of "laxism" over forest encroachment (the officials-accountability angle; WebSearch-quoted excerpt, not directly fetched).
  - Dailynews.co.th and NationTV (Thai-language) — corroborate the exact designation term (พื้นที่ปักหมุดหยุดทุจริต), the "Phangan Model" (พะงันโมเดล) branding, the 14-15 Jul 2026 joint-operation findings across five sites, and the 4,761/3,213 company/nominee-suspect figures plus the single-address/~100-company Koh Samui finding.
  - Confirmed distinct from the existing `koh-phangan-land-disposal-orders-112-companies-2026` and `nominee-crackdown-krabi-islands-2026` guides (both read in full) — those target buyers/companies via the Land Department; this is the NACC's own oversight layer, which explicitly names negligent local officials as a target for the first time.

## 2. kb-0207 — `developer-guaranteed-rental-yield-red-flags-thailand`

- **Title:** Developer 'guaranteed rental yield' villa deals: how the guarantee is actually funded, and where it can break
- **faqCategory:** costs
- **Sources:**
  - Houseviser — Rental pool and guaranteed return programs in Phuket: how they actually work (funding mechanism: inflated purchase price as sinking fund; post-guarantee reversion to market terms; red-flags list). Phuket-sourced; framed as a mechanism generic to Thai resort-villa guarantee programs, not claimed as Phangan-specific.
  - ThailandLawOnline — Civil and Commercial Code Section 8 (force majeure, quoted verbatim) and Section 219 (impossibility-of-performance relief).
  - FazWaz Thailand Property News — How developers may invoke Force Majeure in Thailand Real Estate (real-world pattern: developers sent force-majeure notices to suspend rental guarantees after COVID-19 collapsed occupancy; direct fetch 403'd, verified via WebSearch-quoted excerpt).
  - Thai Real Estate Attorneys — Breach of Contract in Thailand (damages limited to natural loss, default interest, rescission/restitution, 5-year prescription on periodic payments).
  - Cross-linked to the already-published `company-strike-off-defunct-property-holding-thailand` (thin-SPV counterparty risk), `buying-off-plan-new-developments` and `vetting-villa-property-management-company` (both read in full — neither covers the guarantee-funding mechanism or the force-majeure clause).
  - Deliberately excluded an SEC/collective-investment-scheme angle: search only returned generic investor-alert boilerplate, no source tying Thai securities law specifically to villa rental-guarantee schemes — left out per this site's conservative-claims standard.

Both EN/RU pairs added to `src/content/knowledge-base.ts` / `.ru.ts` (kbId kb-0206, kb-0207), dedup-checked against all 205 existing slugs (`grep -c "NACC\|Phangan Model\|guaranteed"` confirmed neither topic was previously covered), `tsc --noEmit` clean. `content-pipeline/backlog.md` updated: the NACC row (a same-day discovery, not a pre-existing ⏳ row) and the guaranteed-rental-yield row both marked ✅ with discovery notes.
