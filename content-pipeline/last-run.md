# Last run — 2026-09-06

Published 2 guides (EN + RU each). Every ⏳ backlog item other than these two had already
been checked and re-checked in prior runs as duplicate/thin/unsafe (water crisis stuck on
PWA Notice 7/2569 with no successor; FBA/AMLA predicate-offence still Ombudsman/AMLO review
only; rental yields, power-grid cable, stamp duty vs SBT, off-plan project vetting and the
coalition policy stance all still duplicate or too thin — see inline notes in backlog.md).
These two were the only backlog rows not yet resolved, both freshly discovered 2026-09-05/06
and both flagged "verify before writing" — so this run's work was source verification first,
then authoring.

## 1. kb-0141 — `housing-estate-juristic-entity-thailand`

- **Title (EN):** Who runs a Koh Phangan housing estate once the developer sells out: the
  juristic entity buyers must form
- **Title (RU):** Кто управляет посёлком на Ко Пангане после того, как застройщик распродал
  участки: юридическое лицо, которое обязаны создать покупатели
- **faqCategory:** structures
- **Sources:**
  - WSR Law Group's summary of the Land Development Act B.E. 2543, Sections 44-53 — fetched
    directly and successfully (the backlog flagged two of three candidate sources as 403ing;
    this one wasn't among them and gave a full, internally consistent picture).
  - Thailand Law Library (Siam Legal), two dedicated pages on establishing the juristic
    entity and on the maintenance-fee sections — both 403'd on direct fetch, cited via
    search-result-snippet content (consistent with this site's established practice for
    paywalled/bot-blocked law-firm pages), cross-checked against WSR's numbers for internal
    consistency.
  - A Thai-language search corroborating the general-meeting half-vote threshold for by-law
    and fee-ratio changes.
- Distinct from the already-published `land-allocation-act-subdivided-land-koh-phangan`
  (kb-0117), which covers only the 10-plot licensing trigger, never the buyer-governance
  entity itself — confirmed by re-reading that guide's body in full before writing.

## 2. kb-0142 — `buying-property-with-cryptocurrency-thailand`

- **Title (EN):** Buying a Koh Phangan property with cryptocurrency: what the SEC's payment
  ban means for your purchase
- **Title (RU):** Покупка недвижимости на Ко Пангане за криптовалюту: что означает запрет
  SEC на оплату криптоактивами
- **faqCategory:** costs
- **Sources:**
  - Baker McKenzie (Blockchain blog) — directly fetched, confirms the core claim: Thailand's
    SEC banned licensed digital-asset businesses from facilitating crypto as a payment
    method for goods/services, effective 1 April 2022.
  - Silk Legal and HLB Thailand — independent law/audit-firm sources confirming BOT Circular
    8434/2568 (effective 29 Dec 2025), which requires enhanced source-of-funds verification
    on inbound transfers of USD 200,000+.
  - The backlog flagged the "convert first, developer-wallet doesn't count" mechanic as
    thinly (marketing-adjacent) sourced. Rather than lean on those weak sources, the guide
    derives that point as a direct logical consequence of this site's own already-verified
    FET-form mechanics (`bringing-money-into-thailand-fet-form`): a foreign buyer's inward
    remittance must be documented foreign currency, which a wallet-to-wallet crypto transfer
    never generates. No claim in the guide rests on an unverified marketing source.

Both guides type-check cleanly (`tsc --noEmit`) and cross-link to existing related guides in
both languages.
