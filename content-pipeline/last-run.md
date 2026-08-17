# Last run — 2026-08-17

**Guides published:** 2 (of 2 targeted)

---

## Guide 1

- **slug:** `offshore-family-trust-cannot-hold-thai-land`
- **kbId:** `kb-0096`
- **title (EN):** Why an offshore family trust can't hold your Thai villa or land
- **title (RU):** Почему зарубежный семейный траст не может владеть вашей тайской виллой или землёй
- **faqCategory:** `structures`
- **faqQuestion:** Can I put my Thai villa or land into a family trust from my home country?
- **Sources used:**
  - ThaiLawOnline — Trusts in Thailand via Foreign Jurisdiction (confirms no Land Office mechanism to register a trustee's title; recommends Thai wills/usufruct instead of a foreign trust)
  - Sovereign Group — Planning for the future: how Trusts can elevate wealth and asset management in Thailand (confirms an offshore trust set up by a Thai resident must be limited to non-Thai assets; nominee-risk framing)
  - Thailand Law Forum — Civil and Commercial Code Sections 1646–1710 (primary citation for Section 1686, the general trust-voiding provision in force since the Code's 1935 adoption)
  - Lexology / Baker McKenzie — Thailand's Private Trust Act Is Approved by the Cabinet (basis for the July 2018 Cabinet approval; corroborated by a second search that the bill remains under Council of State review with no 2026 enactment found)
  - Thailand SEC — Trust for Transactions in Capital Market Act B.E. 2550 (2007), primary statute text for the sole, capital-markets-only trust exception

This was an unflagged, backlog item (structures, 🟡). No existing guide in `knowledge-base.ts` addressed trusts before this. Distinct from the published nominee-company and inheritance guides — the closest neighbors (`villa-held-by-thai-company-buyer-due-diligence-2026`, `foreign-heir-inheriting-thai-land-section-93`, `sap-ing-sith-right-of-use-thailand`) are cross-linked rather than duplicated.

---

## Guide 2

- **slug:** `price-per-area-benchmark-2026-thong-sala-sri-thanu-haad-yao`
- **kbId:** `kb-0097`
- **title (EN):** Land price benchmarks 2026: Thong Sala vs Sri Thanu vs Haad Yao, per square metre and per rai
- **title (RU):** Ориентиры цен на землю 2026: Тонг Сала против Шри Тхану против Хаад Яо, за квадратный метр и за рай
- **faqCategory:** `phangan`
- **faqQuestion:** How do Thong Sala, Sri Thanu and Haad Yao actually compare on land price per square metre?
- **Sources used:**
  - Islanders Properties — live August 2026 land-for-sale listing pages for Srithanu, Haad Yao and Thongsala. Per-m² figures were computed directly from each listing's price ÷ area (not taken from any third-party aggregate stat), and the guide explicitly discloses these are asking-price samples from one portal, not closed-sale or government valuation data.
  - Cross-referenced (not re-cited as external) against the already-published `koh-phangan-market-outlook-2026` (kb-0014) for island-wide average price and west-coast appreciation context, to keep the two guides consistent.

This was the second unflagged backlog item (phangan, 🟢). Distinct from the existing qualitative single-district guides (`buying-in-thong-sala`, `buying-in-sri-thanu`, `buying-in-haad-yao-haad-salad`, none of which give hard per-m²/per-rai figures) and from the general `how-land-is-priced-price-per-rai` explainer (which covers units and value drivers, not a district-by-district price table).

---

## Notes on backlog items evaluated but not published today

Several higher-tier backlog items were left `⏳` rather than re-attempted, because each already carries a prior-run note explaining a substantial-duplicate or unverifiable-claim finding, and this run did not identify a new angle changing that assessment:
- 🔴 "2026 Land and Building Tax: no reduction decree" — flagged duplicate of `kb-0027`.
- 🔴 "8-province corporate landholder database (Surat Thani)" — flagged as overlapping 5+ published guides on the same raid/flagged-company narrative.
- 🟡 "Foreign Business Act amendment / nominee as AML predicate offence" — thinner sourcing noted in the backlog itself; not attempted this run in favor of the two cleaner, unflagged topics.
- 🟢/🟡 "Non-resident vs resident rental income tax", "Realistic villa rental yields", "Who's actually buying on Phangan 2026", "Stamp Duty vs SBT", "Vetting a specific off-plan project" — each carries a prior-run duplicate note.
- 🟢 "Koh Phangan's power grid reliability" and 🟡 "Island wastewater and sewage rules" — flagged respectively as overlapping `kb-0026` and as lacking a citable primary source for the core legal claim.

Per the hard quality gate, both published guides are grounded in sources fetched and verified this run (not carried over from memory), are genuinely distinct from existing coverage, and disclose their data's limits (asking-price listing sample; pending, non-enacted bill status) rather than overstating certainty. `npx tsc --noEmit` passes clean on both content files. kbId sequence continues at kb-0096–0097 (prior max was kb-0095).
