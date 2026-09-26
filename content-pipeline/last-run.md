# Content pipeline — last run

**Date:** 2026-09-26

No pre-existing ⏳ backlog row cleared the bar (all re-confirmed duplicate/thin/unsafe — see the 2026-09-26 discovery note in `backlog.md`). A fresh-news sweep (2026-09-24/26 window) found nothing genuinely new and Koh-Phangan-relevant — a Deputy Interior Minister probe into Israeli-linked/Chabad land purchases and a Phuket permit violation is a real, novel enforcement angle, but it's southern-border/Phuket-specific, not Phangan/Samui, and one day outside the window, so it wasn't published. Both guides below came from independent evergreen gap-mining against the full 202-guide catalog.

## 1. kb-0202 — `fraudulent-property-transfer-creditor-revocation-thailand`

- **Title:** CCC Section 237: can a creditor unwind the transfer that put your land in the seller's hands?
- **faqCategory:** documents
- **Sources:**
  - ThailandLawOnline — CCC Sections 194-240 (Contract, Obligations and Performance Law) — primary-text translation of Sections 237-240.
  - Siam Legal Thailand Law Library — CCC Obligations (Sections 233-240) — independent translation, cross-check.
  - Integrity Legal — dedicated commentary on Section 237 (Cancellation of Fraudulent Acts).
  - Watson Farley & Williams (2026) — Thai courts' treatment of fraudulent asset transfers in restructuring, for real-world application.
  - All four independently re-verified via a direct quote-check of the operative section text before writing.

## 2. kb-0203 — `land-code-section-95-nationality-change-land-disposal`

- **Title:** Land Code Section 95: what happens to land a Thai national held before losing Thai nationality
- **faqCategory:** ownership
- **Sources:**
  - ThailandLawOnline — full Land Code Act translation (Section 95 text, plus Sections 86-87/94 for the cap and disposal mechanism).
  - Siam Legal Thailand Law Library — Land Act 2497: Limitations of Foreigner Rights (Sections 86-96) — independent cross-check.
  - FAOLEX (FAO) — official translation PDF of the Land Code Promulgating Act, B.E. 2497.
  - Note: sourcing here is thinner than usual — no dedicated practitioner article analyzing Section 95's practical stakes was found, only bundled Sections 86-96 overview/translation pages. The guide leans on the primary statute text (independently re-verified via direct quote-check) plus explicit cross-links to the site's own Section 94/93 guides, and is framed conservatively (flags that actual loss of Thai nationality is a separate question under the Nationality Act B.E. 2508, not asserted as automatic).

Both EN/RU pairs added to `src/content/knowledge-base.ts` / `.ru.ts` (kbId kb-0202, kb-0203), dedup-checked against all 202 existing slugs, `tsc --noEmit` clean. `content-pipeline/backlog.md` updated with a discovery note (neither was a pre-existing ⏳ row).
