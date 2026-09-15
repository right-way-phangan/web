# Last run — 2026-09-15

Published 2 guides (EN + RU each). One was a long-standing, previously-verified ⏳ backlog candidate (held back on 2026-09-12 in favour of the timeshare topic); the other was a fresh find from an evergreen-gap-mining pass, since a parallel fresh-news sweep turned up nothing new.

## 1. kb-0175 — `repatriating-sale-proceeds-exchange-control-act`
- **Title:** Repatriating your Thai property sale proceeds: what the bank needs for the profit, not just the principal
- **faqCategory:** costs
- **Sources:**
  - Baker McKenzie — "Thailand: Repatriation Exemption for Foreign-Sourced Funds" (Feb 2026 insight) — direct fetch; confirmed the two-stage January 2026 threshold change (20 Jan, export proceeds; 27 Jan, all other foreign-sourced funds; USD 1M → USD 10M).
  - Acclime — "Profit Repatriation: Transferring Money Out of Thailand" — search-verified on the documentation bundle and lack of case-by-case BOT approval for legitimate outbound transfers.
  - Silk Legal — "Repatriating Profits from Thailand in 2025" — cross-check on the same mechanics.
  - Thai Revenue Department — official Tax Clearance Certificate page (rd.go.th/english/23518.html) — direct fetch, primary source, confirmed the Form P.3 scope (outstanding tax/departure scenarios only, not a blanket requirement).

**Why it's distinct / framing note:** The backlog row framed the Jan 2026 BOT threshold change as relevant to a seller repatriating sale proceeds. On verification this doesn't hold up as originally framed — that change eases the *inbound* repatriation requirement for Thai residents' foreign-held funds, the opposite direction from a foreign seller's *outbound* transfer. Rather than dropping the topic, the guide corrects this explicitly (a dedicated section explains why the news hook doesn't apply) and instead earns its place through the genuinely distinct principal-vs-profit documentation angle: the existing `bringing-money-into-thailand-fet-form` (kb-0019) covers inbound purchase funds and only briefly touches outbound repatriation in its closing section; this guide is the first to explain that the original FET only backs the *principal*, and that the gain above it is evidenced by the Land Office's own sale/withholding-tax/SBT receipts instead — plus the separate, narrower Tax Clearance Certificate question. Confirmed distinct by reading kb-0019 in full.

## 2. kb-0176 — `electronic-signatures-property-contracts-thailand`
- **Title:** Can you sign a Koh Phangan property contract electronically? What the Electronic Transactions Act does and doesn't cover
- **faqCategory:** documents
- **Sources:**
  - Thanathip & Partners — "Electronic Signature" — direct fetch; confirmed the Royal Decree B.E. 2549 exemption text covers "sale of immovable property... mortgage, lease of immovable property for three years or more."
  - FRANK Legal & Tax / Lexology — "Is It Secure to Use E-Signatures for Commercial Transactions in Thailand?" — cross-check.
  - Docusign — Thailand legality summary — direct fetch; the clearest single source, stating outright that Land Office registration can't be done electronically (no enabling internal regulation) and that Thai legal professionals advise wet-ink signatures for property sale agreements specifically, despite the ETA's general validity.
  - Tilleke & Gibbins — "Thailand Set to Overhaul Its E-Transactions Framework" — direct fetch; confirmed the ETDA's 12 May–15 June 2026 public hearing dates on a full ETA redraft, and that neither the draft nor law-firm commentary on it touches the immovable-property exemption.

**Why it's distinct:** Confirmed via full-text check across the catalog that no existing guide mentions e-signatures, electronic transactions, or DocuSign. Closest guides are `sale-purchase-agreement-earnest-money-ccc-thailand` (CCC enforceability of the SPA and earnest money — never addresses signature method) and `apostille-convention-power-of-attorney-thailand-2027` (document legalisation for a POA — a different formality problem). Read both in full to confirm no overlap.

**Flagged uncertainty:** Could not obtain the Royal Decree's primary text directly (two WebFetch attempts on secondary sources both quoted the same exemption clause but neither clarified whether it reaches the *preliminary* private SPA, as opposed to only the registered sale itself). Resolved conservatively: rather than asserting a bright-line answer the primary text doesn't clearly support, the guide follows the converging practical advice from multiple independent sources (wet-ink for the SPA regardless) and only calls e-signing genuinely low-risk for reservation/earnest-money receipts and leases under three years, which sit unambiguously outside the Royal Decree's carve-out.

## Process notes

A research agent ran a fresh-news sweep (2026-09-10/15 window) in parallel with the author's own targeted research. The sweep re-confirmed all four standing watch items unchanged (PWA Notice 7/2569 still the only Koh Phangan-specific water notice, no successor; FBA/AMLA predicate-offence still Ombudsman/AMLO review only; coalition "review foreign ownership" pledge still marketing-site-only; 99-year leasehold bill/condo-quota reform both still cabinet-study-only) and found nothing newly dated beyond items already published. The agent's own evergreen-gap-mining pass (grepping all 174 pre-existing slugs) surfaced the e-signature topic as genuinely uncovered.

`content-pipeline/backlog.md` updated: the pre-existing repatriation row marked ✅ with a publish note; a discovery note logged inline (top of section A, the most-recent-first convention this file uses) documenting both topics, their sourcing, and why no new row was added for the e-signature topic (it wasn't a pre-existing ⏳ backlog item, consistent with how this file has handled fresh evergreen finds before).

TypeScript typecheck (`npx tsc --noEmit -p .`) run clean against both content files. Verified no duplicate slugs/kbIds and full EN/RU slug parity (175 matching entries each) before finishing. Verified every internal `/knowledge/<slug>` cross-link added in both new guides resolves to a real, existing slug.
