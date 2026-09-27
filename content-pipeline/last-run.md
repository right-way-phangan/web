# Content pipeline — last run

**Date:** 2026-09-27

No pre-existing ⏳ backlog row cleared the bar (all re-confirmed duplicate/thin/unsafe — unchanged from 2026-09-26). A fresh-news sweep (2026-09-24/27 window) found nothing genuinely new and Koh Phangan-relevant (a BOI LTR-visa-renewal webinar recap and a nationwide flash-flood warning, neither publishable). Both guides below came from evergreen gap-mining against the full 203-guide catalog — a first candidate (CCC Sections 1304-1306, public domain land) was caught as a duplicate of the existing kb-0152 before writing and dropped; a second gap-mining pass found the two topics actually published.

## 1. kb-0204 — `land-code-section-58-ter-chanote-upgrade-aerial-photo`

- **Title:** Land Code Section 58 ter: how Nor Sor 3 Gor land gets upgraded to a Chanote without a full survey
- **faqCategory:** documents
- **Sources:**
  - Thailand Law Online — full translation of the Thailand Land Code Act (Section 58 ter).
  - Siam Legal Thailand Law Library — Land Act 2497: Rights in Land (Sections 56-58).
  - G.A.M. Legal Alliance — Land Code Act 1954.
  - FAOLEX (FAO) — Land Code Promulgating Act, B.E. 2497 (1954), official translation.
  - Direct fetches of the primary-text pages returned 403/blocked (consistent with this KB's established pattern for these sources); the operative text was independently verified via convergent WebSearch-quoted excerpts across multiple sources before writing.

## 2. kb-0205 — `land-code-section-63-lost-title-deed-substitute-fraud-risk`

- **Title:** Your title deed is lost: Land Code Section 63's substitute-deed process, and the fraud window built into it
- **faqCategory:** documents
- **Sources:**
  - Siam Legal Thailand Law Library — Land Act 2497: Rights in Land (Sections 61-64) — core Section 63 mechanism (WebSearch-quoted excerpt, direct fetch 403'd).
  - PropertyScout — Land Title: What to do in case of Loss or Damage (direct fetch) — procedural detail (police report, witnesses, 30-day notice).
  - Company Thailand — Title deed lost and how to do a replacement title deed in Thailand (direct fetch) — cross-check on timeline/fee/original-cancellation.
  - Framed conservatively: the fraud-prevention angle is presented as the law's own acknowledged safeguard (per PropertyScout), not as a documented Koh Phangan-specific incident, since none was found.

Both EN/RU pairs added to `src/content/knowledge-base.ts` / `.ru.ts` (kbId kb-0204, kb-0205), dedup-checked against all 203 existing slugs, `tsc --noEmit` clean. `content-pipeline/backlog.md` updated with a discovery note (neither was a pre-existing ⏳ row).
