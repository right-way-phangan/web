# Last run — 2026-08-04

**Guides published:** 2

---

## Guide 1

- **slug:** `inheritance-tax-thai-property-100-million-threshold`
- **kbId:** `kb-0081`
- **title (EN):** Inheritance tax on Thai property: the 100-million-baht threshold most villa owners' estates never reach
- **title (RU):** Налог на наследство в Таиланде: порог в 100 миллионов бат, до которого не дотягивает большинство вилл на Пангане
- **faqCategory:** `costs`
- **faqQuestion:** Does Thailand have an inheritance tax, and will my heirs owe it on my Koh Phangan villa?
- **Sources used:**
  - Inheritance Tax Act, B.E. 2558 (2015) — Revenue Department's own unofficial English translation (rd.go.th, PDF), read directly for Sections 11–23: liability, the per-heir/per-testator threshold test, the appraised-value valuation rule, 5%/10% rates, the 150-day filing deadline, and the 5-year installment option
  - PwC Thailand Tax Summaries — corroborated the "per testator" threshold framing and rate structure
  - Expat Tax Thailand — general context and exemptions cross-check

## Guide 2

- **slug:** `disputing-land-building-tax-assessment`
- **kbId:** `kb-0082`
- **title (EN):** Disputing your Land and Building Tax bill: the appeal process, deadlines and what actually moves an assessment
- **title (RU):** Оспаривание счёта по налогу на землю и строения: порядок обжалования, сроки и что реально меняет оценку
- **faqCategory:** `costs`
- **faqQuestion:** What can I do if I think my Land and Building Tax assessment on Koh Phangan is wrong?
- **Sources used:**
  - Land and Buildings Tax Act, B.E. 2562 (2019) — unofficial English translation (fpo.go.th, PDF), read directly for Chapter X (Sections 73–82): the objection-to-local-administrator step, the 30/60/30-day deadlines, the Changwat Tax Assessment Appeal Committee's composition, the no-automatic-stay-of-payment rule, and the final court-appeal route
  - ThailandLawOnline — confirmed the ภ.ด.ส.06 assessment-notice form and the February/April notice-and-payment timeline
  - Pangae Subdistrict Administrative Organisation e-service page — confirmed the ภ.ด.ส.10 objection form is filed under Section 73 in current municipal practice

---

## Notes

Both guides landed in `costs` (unavoidable — the next available non-duplicate topics in strict backlog priority order both happened to be costs topics; see skip list below).

Selection followed backlog priority order (🔴 → 🟢 → 🟡), skipping duplicates within a tier before moving down:

- The one remaining 🔴 item, "Land Department's new 8-province corporate landholder monitoring database," was re-checked against `land-department-audit-existing-landholding-companies-2026` (kb-0051) and confirmed still duplicative (same May 2026 circulars, same monthly-review/quarterly-DOL-reporting mechanism, same Section 97/98 thresholds) — left `⏳` per the prior run's note, no new angle found.
- First 🟢 item, "Non-resident vs. resident rental income tax," turned out to substantially duplicate `owners-taxes-annual-land-and-income` (kb-0027), which already covers resident/non-resident treatment, the 30% deduction, progressive rates and the PND.90 deadline in depth. **Skipped**, marked with an inline backlog note.
- Second 🟢 item, "Inheritance tax on Thai property," was genuinely distinct (existing `inheritance-leasehold-and-villa` guide covers *who inherits what asset*, not *whether tax is owed*) and well-sourced directly from the Revenue Department's own translation of the Act. **Published as Guide 1.**
- Third 🟢 item, "Koh Phangan's power grid reliability (single undersea cable)," overlaps substantially with the existing `utilities-water-electricity-internet-koh-phangan` (kb-0026) electricity section, which already covers the submarine cable circuits and the EGAT/PEA 230kV upgrade project. Fresh search also complicated the "single cable" framing (the island runs on four existing circuits, with a new 2-circuit project due ~2028/2029, not one cable). **Skipped**, marked with an inline note.
- First 🟡 item, "Realistic villa rental yields," is a near-exact duplicate of `renting-out-your-villa-rules-and-taxes` (kb-0010), whose subtitle is literally "the 30-day rule, taxes and realistic yield" and already frames yield as median rate × occupancy minus real costs vs. brochure numbers. **Skipped**, marked with an inline note.
- Second 🟡 item, "Disputing your Land and Building Tax bill," was distinct (no existing guide covers the objection/appeal process) and sourced directly from the Act's own Chapter X text. **Published as Guide 2.**

Both guides cross-link to existing, verified slugs (`cost-of-buying-taxes-and-fees`, `inheritance-leasehold-and-villa`, `thailand-will-registration-rules-2026`, `owners-taxes-annual-land-and-income`, `vacant-land-tax-step-up-agricultural-loophole-2026`), all confirmed present in both EN/RU files before use.

`tsc --noEmit`, `eslint`, and `node scripts/build-guide-changelog.mjs` all pass clean. kbId sequence intact through kb-0082. EN/RU slug and kbId sets confirmed identical (81 entries each, no duplicates).

Remaining ⏳ backlog, next-priority first: 🟢 — right of habitation, Koh Phangan airport status (both ⚪️, deprioritized); 🟡 — undeveloped-neighbour due diligence, SBT 5-year exemption, foreign-spouse usufruct/superficies protection, Minor Hotels' Avani/KAIA opening, 2027 land valuation reform, cruise ship pier proposal, who's buying on Phangan in 2026, island wastewater rules. Three topics now carry "skipped as duplicate" notes (non-resident/resident rental income tax, Phangan power grid reliability, realistic rental yields) and should be treated as effectively closed unless a genuinely new angle surfaces.
