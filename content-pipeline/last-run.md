# Content pipeline — last run

**Date:** 2026-09-28

Backlog re-check: every pre-existing ⏳ row was already flagged duplicate/thin/unsafe by prior runs (water crisis stuck on PWA Notice 7/2569; LBT no-reduction-decree duplicates kb-0027; FBA/AMLA predicate-offence still Ombudsman/AMLO-review-only; realistic-rental-yields row duplicates kb-0010; power-grid single-cable duplicates kb-0026; "who's buying" surge duplicates kb-0014; stamp duty vs SBT duplicates kb-0084; off-plan project vetting declined on naming-a-specific-developer grounds; coalition stance and PND e-filing date both thin/stale) — not re-verified from scratch, carried forward. A fresh-news sweep (2026-09-24/28 window) found nothing genuinely new and non-duplicate (nominee-crackdown headcount refreshes, a Laem Son Beach follow-up, and agricultural land-tax figures all traced to already-published or already-dated content; nationwide flood warnings had no Koh-Phangan-specific hook). Two genuinely distinct, well-sourced evergreen topics were found instead via gap-mining and published.

## 1. kb-0208 — `class-action-lawsuit-civil-procedure-code-thailand`

- **Title:** Can multiple Phangan buyers sue one developer together? Thailand's class-action lawsuit procedure
- **faqCategory:** process
- **Sources:**
  - Tilleke & Gibbins — Class Action Legal Proceedings Now Available in Thailand.
  - Tilleke & Gibbins — Thailand Certifies First Class Action.
  - DFDL — Thailand Legal Update: Incoming Class Action Law – Section 222/8 of the Civil Procedure Code.
  - Siam Legal (Thailand Law Library) — Class Action Lawsuit in Thailand.
  - Legal 500 — Thailand: Class Actions – Country Comparative Guides.
  - Confirmed distinct from the existing `consumer-case-procedure-act-buyer-developer-disputes` (kb-0154, read in full) — that guide covers only the individual-plaintiff simplified consumer-court procedure; this covers Civil Procedure Code Sections 222/1-222/49 (2015 amendment), the certification test, and the opt-out binding model for combining many buyers' claims into one case.

## 2. kb-0209 — `social-security-workmens-compensation-villa-staff-thailand`

- **Title:** Hiring villa or resort staff on Koh Phangan: Social Security and Workmen's Compensation obligations
- **faqCategory:** costs
- **Sources:**
  - Omni HR — SSO Thailand: Social Security Contributions Guide (2026).
  - One Asia Lawyers — Updated Social Security Contribution Wage Base and Enhanced Benefits under Section 33.
  - Gentle Law/IBL — Thailand Social Security Registration 2026: Employer Setup, Monthly Filing, and the New Wage Ceiling.
  - TMA Group — The Workmen's Compensation Fund (WCF) in Thailand.
  - Confirmed distinct from `domestic-worker-labour-law-villa-staff-thailand` (read in full — that guide's carve-out applies only to staff employed directly for an owner's personal household, not staff employed through a business), `work-permit-foreign-owner-rental-management-business` and `vetting-villa-property-management-company` (both read in full, neither covers employer SSO/Workmen's Comp duties).

Both EN/RU pairs added to `src/content/knowledge-base.ts` / `.ru.ts` (kbId kb-0208, kb-0209), dedup-checked against all 207 existing slugs, `tsc --noEmit` clean. `content-pipeline/backlog.md` updated: both rows added with ✅ status and discovery notes (same-day discoveries, not pre-existing ⏳ rows).
