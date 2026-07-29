# Last run — 2026-07-29

**Guides published:** 2

---

## Guide 1

- **slug:** `hillside-slope-building-limits-koh-phangan`
- **kbId:** `kb-0073`
- **title (EN):** Hillside building limits on Koh Phangan: the slope-percentage tiers that decide what you can build
- **title (RU):** Ограничения на застройку склонов на Ко Пангане: уровни по уклону, которые решают, что можно построить
- **faqCategory:** `structures`
- **faqQuestion:** What slope gradient triggers Koh Phangan's strictest hillside building limits, and how do I get a plot's slope tier confirmed before I design a villa?
- **Sources used:**
  - ONEP — Surat Thani provincial environmental protection area notice, Royal Gazette Vol. 142, Special Section 199 Ng, 21 May 2025 (legal basis)
  - Samui Island Realty — Koh Samui building regulations: land zoning & slope rules (exact gradient-tier figures)
  - Archi Studio — Koh Samui building regulations for villas (cross-check on the same tier figures)
  - Khaosod English — Ex-Beckham villa among properties raided in Koh Samui crackdown, 25 Jul 2025 (real enforcement case)

## Guide 2

- **slug:** `off-grid-solar-battery-storage-koh-phangan-villa`
- **kbId:** `kb-0074`
- **title (EN):** Off-grid solar and battery storage for a Koh Phangan villa: 2026 costs and when it actually pays off
- **title (RU):** Автономные солнечные панели и накопители для виллы на Ко Пангане: затраты 2026 года и когда это окупается
- **faqCategory:** `costs`
- **faqQuestion:** Is off-grid solar and battery storage worth it for a Koh Phangan villa, and what does it actually cost in 2026?
- **Sources used:**
  - Green Energy Thailand — Solar Panel Installation Costs in Thailand 2026 (THB/kW pricing by system size)
  - Green Energy Thailand — Off-Grid Solar in Thailand: Is Complete Energy Independence Possible? (off-grid vs. hybrid cost/use-case split)
  - Solar Panels Thailand — Solar Batteries & Storage Systems (LFP cycle-life and warranty figures)
  - Mykeythai — Power Supply Koh Samui: Electricity & Outages Guide (grid-intermittency context motivating the outage-protection case)

---

## Notes

The previous run (2026-07-28) had deliberately skipped "Hillside building limits in practice" under the hard quality gate, flagging that it would overlap with the "hillside overlay" section already in `coastal-setback-rules-koh-phangan-distance-from-beach` (kb-0070) unless it brought a genuinely distinct angle. This run cleared that bar: the earlier guide only says slopes over "roughly 35%" trigger tighter limits and the steepest are "barred outright," with no exact figures for the upper tiers. This new guide adds the precise gradient bands (35-50% and >50%), the specific footprint (~80-90 m²), green-space (70-75%), cut-and-fill (~2 m) and engineer-certification requirements for the 35-50% tier, a due-diligence checklist for confirming a plot's tier before design, and ties it to a real 2025 enforcement case (the Koh Samui hillside-villa raids, including the ex-Beckham property) — genuinely deeper rather than a restatement.

Guide 2 is a deliberate companion to the existing `pea-rooftop-solar-buyback-2026` guide (kb-0057), which covers the grid-tied feed-in scheme's economics but not battery storage. This guide covers the separate battery purchase — grid-tied+battery hybrid vs. full off-grid — with real 2026 THB install costs, LFP battery lifespan/warranty, and payback framed around outage resilience (the island's genuinely intermittent PEA grid) rather than the buyback tariff, without repeating the buyback-scheme mechanics already published there.

Both guides cross-link to existing, verified slugs (`coastal-setback-rules-koh-phangan-distance-from-beach`, `koh-phangan-building-zones`, `samui-model-hillside-enforcement-koh-phangan`, `pea-rooftop-solar-buyback-2026`, `buying-in-bottle-beach`, `buying-in-than-sadet`), all confirmed present in both EN/RU files before use.

`tsc --noEmit` passes clean. EN/RU slug sets are identical (73 slugs each), no duplicates, kbId sequence intact through kb-0074.

Remaining ⏳ backlog, next-priority first: 🟢 — what a Phangan property lawyer's fee actually buys; then 🟡 — OCPB landlord leasing rules (3+ units), water-shortage risk, 2025–2026 development pipeline, rental-yield drivers, Land and Building Tax appeal process, undeveloped-neighbour due diligence, SBT 5-year exemption, foreign-spouse usufruct/superficies protection, Minor Hotels' Avani/KAIA opening; then ⚪️ — right of habitation, Phangan airport status.
