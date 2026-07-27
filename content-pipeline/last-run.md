# Last run — 2026-07-27

**Guides published:** 2

---

## Guide 1

- **slug:** `withholding-tax-property-sale-individual-vs-company`
- **kbId:** `kb-0069`
- **title (EN):** Withholding tax on a property sale: how the individual calculation differs from a company's flat 1%
- **title (RU):** Налог у источника при продаже недвижимости: чем расчёт для физлица отличается от плоской ставки 1% для компании
- **faqCategory:** `costs`
- **faqQuestion:** How is withholding tax calculated when I sell my Koh Phangan property, and does it differ if I sell through a Thai company?
- **Sources used:**
  - Acclime Thailand — step-by-step individual withholding-tax mechanics (appraised value → years-owned deduction → divide by years → progressive PIT → multiply back) and the company's flat 1% basis
  - Terms.Law — corroborating deduction table (92%→50% across 1–8+ years), SBT/stamp-duty mutual exclusivity, tabien-baan exemption
  - Siam Legal International — corroborating progressive PIT bracket structure and general transfer-tax picture

## Guide 2

- **slug:** `coastal-setback-rules-koh-phangan-distance-from-beach`
- **kbId:** `kb-0070`
- **title (EN):** Coastal setback rules on Koh Phangan in practice: height, floor-area and green-space limits by distance from the beach
- **title (RU):** Прибрежные отступы на Ко Пангане на практике: ограничения по высоте, площади застройки и озеленению по удалённости от пляжа
- **faqCategory:** `structures`
- **faqQuestion:** How close to the beach can I build, and what height and floor-area limits apply on a Koh Phangan coastal plot?
- **Sources used:**
  - ONEP (Office of Natural Resources and Environmental Policy and Planning) — primary: Royal Gazette citation for the Surat Thani provincial environmental protection notice (Vol. 142, Special Section 199 Ng, 21 May 2025, effective 22 May 2025, 5-year term), confirmed to explicitly cover Koh Phangan's subdistricts alongside Koh Samui/Koh Tao
  - Sukhothai Inter Law — same source already cited in the existing overview guide `koh-phangan-building-zones`, used here for continuity/consistency
  - Samui Island Realty and Conrad Properties — corroborating practical figures (10m/50m/200m distance bands; 6m/12m height caps; 75 m² footprint; 80m/140m elevation tiers; slope-based restrictions), cross-checked against each other and against numbers already published site-wide in existing per-district guides before use

---

## Notes

Both were the two top-priority unpublished 🟢 topics in `backlog.md` section B — no 🔴 rows remained anywhere in the backlog (all news-tier rows are ✅), so priority moved to the top of the 🟢 tier, taken top-down. Neither slug pre-existed in `knowledge-base.ts` (67 existing articles scanned before this run; kbId continued cleanly at kb-0069/kb-0070; 69 after).

Guide 1 fills a real gap flagged by the site's own existing content: the `selling-leasehold-villa-exit-liquidity` guide explicitly punts on the withholding-tax calculation ("consult a Thai accountant for the exact calculation"). This guide supplies that calculation, with a worked example independently recomputed from the standard PIT bracket table (rather than reused verbatim from a single source, since example figures varied slightly across sources — the mechanism itself, not any one source's arithmetic, is what's being claimed).

Guide 2 is a deliberate practical companion to the existing `koh-phangan-building-zones` overview (kb-0003) and the many per-district guides that already cite the same numeric tiers (10m/50m/200m distance bands, 80m/140m elevation tiers) — it does not duplicate that overview but goes one level deeper into the exact figures those other guides already assume as background, and adds a primary legal citation (Royal Gazette via ONEP) that the existing guides lacked. One nuance flagged explicitly inside the guide: a separate, older nationwide coastal-setback rule (reported elsewhere as a 1997 Ministry of Science regulation, with 200m/400m bands up to 23m height) surfaced in one secondary source but was deliberately excluded, since it could not be confirmed as the operative rule for the current island-specific 2025 zoning and including it risked conflating two different regulations — kept conservative per the quality gate.

Both guides cross-link to existing, verified slugs (`thai-company-for-property-49-51`, `selling-thai-company-holding-villa-share-sale-tax`, `cost-of-buying-taxes-and-fees`, `koh-phangan-building-zones`, `building-a-villa-koh-phangan`), all confirmed present in both EN/RU files before use.

`tsc --noEmit` passes clean. EN/RU slug sets are identical (69 slugs each), no duplicates, kbId sequence intact through kb-0070.

Remaining ⏳ backlog, next-priority first: 🟢 — managing a rental villa remotely (vetting a property manager), off-grid solar/battery payback, what a Phangan property lawyer's fee buys; then 🟡 — OCPB landlord leasing rules (3+ units), water-shortage risk, 2025–2026 development pipeline, rental-yield drivers, Land and Building Tax appeal process, undeveloped-neighbour due diligence, SBT 5-year exemption, foreign-spouse usufruct/superficies protection, Minor Hotels' Avani/KAIA opening; then ⚪️ — right of habitation, Phangan airport status.
