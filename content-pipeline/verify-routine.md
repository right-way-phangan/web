# Routine — monthly legal-accuracy verification of knowledge guides

You are headless Claude Code running once a month inside a GitHub Actions runner.
Your job: **re-verify a batch of the oldest, un-checked YMYL knowledge guides against
fresh authoritative sources, correct anything that has gone stale, and log what you
did.** This is a maintenance pass, not authoring — you write NO new guides here.

Why this exists: the daily pipeline auto-publishes ~2 guides/day straight to prod
without human review. The guides cover Thai property law, taxes and ownership (YMYL —
"Your Money or Your Life") — the category Google and AI answer engines judge most
harshly on accuracy. Laws change; a guide written months ago can silently go stale and
then get cited by ChatGPT/Perplexity/AI Overviews. This pass keeps the corpus honest.

## Files — the only ones you may touch

- `src/content/knowledge-base.ts`    → EN guides, `KB_ARTICLES` array (source of truth).
- `src/content/knowledge-base.ru.ts` → RU mirror, `KB_ARTICLES_RU`.
- `content-pipeline/verify-log.md`   → ledger: one row per guide, when it was last verified.
- `content-pipeline/verify-last-run.md` → digest of THIS run (overwrite it entirely).

Do **not** edit any other file. Do **not** add, remove, or rename guides. Do **not**
change slugs or kbIds.

## Step 1 — pick the batch

1. Read `verify-log.md` to see when each slug was last verified. A slug absent from the
   log counts as **never verified**.
2. A guide is a **candidate** when BOTH hold:
   - its `faqCategory` is one of the YMYL categories: `ownership`, `documents`,
     `structures`, `costs`, `process` (skip `phangan` — lifestyle/geography, low
     staleness risk — unless it states a legal rule like the 30-day rental limit);
   - it is **older than 90 days** — i.e. `updated` (or its last-verified date, whichever
     is more recent) is more than 90 days before today. Fresh guides need no re-check.
   Get today's date with `date -u +%Y-%m-%d`.
3. Rank candidates by "longest since last verified" (never-verified first, then oldest).
4. Take up to **VERIFY_COUNT** guides (passed in the prompt; default 6). The cap exists to
   stay inside one session's token/usage budget — it is deliberate, not a bug.
5. **If there are zero candidates** (everything is younger than 90 days, or already
   verified within 90 days): verify nothing, write `verify-last-run.md` saying so, and
   still touch `verify-log.md` only if needed. A no-op month is a legitimate, healthy
   outcome — do NOT invent changes to look busy.

## Step 2 — verify each guide in the batch

For each chosen guide:

1. Identify its 2–4 **checkable claims** — the concrete facts most likely to age:
   tax/fee rates and thresholds, legal limits (e.g. 49% foreign freehold cap, 30+3-year
   lease terms, 30-day short-let rule), effective dates, procedure steps, named acts and
   regulations.
2. Ground each claim with **WebSearch / WebFetch** against authoritative sources — Thai
   government (Land Department / DOL, BOI, Revenue Department, Government Gazette) first,
   then reputable Thai law firms. Prefer primary/official over blogs.
3. Decide per guide:
   - **Still accurate** → change NOTHING in the guide body. Record it as `ok` in the log.
   - **Stale / changed** → edit the affected `body` blocks, `takeaways`, and/or `sources`
     in **both** `knowledge-base.ts` (EN) and `knowledge-base.ru.ts` (RU) — keep the two
     languages at parity, never fix one and leave the other. Bump that guide's `updated`
     to today's date (this is a real content change, so `dateModified` should move). Add
     or refresh a `sources` entry pointing to what you verified against. Record it as
     `updated` in the log with a one-line note of what changed.
   - **Unclear / sources conflict / can't confirm** → do NOT guess-edit YMYL text. Leave
     the guide as-is, record it as `needs-human` in the log, and flag it in the digest for
     Vladimir to check manually.

Editorial rules carry over from authoring: educational tone, **no prices, no
client-segment narrowing**, claims stay conservative. When in doubt, under-claim.

## Step 3 — update the ledger (`verify-log.md`)

Append/refresh one row per guide you verified this run, in the table:

```
| slug | kbId | faqCategory | last-verified (YYYY-MM-DD) | verdict | note |
```

`verdict` ∈ `ok` | `updated` | `needs-human`. Keep existing rows for guides you did not
touch this run. If a slug already has a row, update its date/verdict in place rather than
duplicating it.

## Step 4 — write the digest (`verify-last-run.md`, overwrite fully)

Include:

- date of the run;
- **Guides verified:** N (must be a number — this line is a required tripwire; the
  workflow fails the run if this file is untouched);
- for each verified guide: slug, verdict, and — if `updated` — a one-line summary of the
  change and the source that drove it; if `needs-human` — what to check;
- **Queue remaining:** how many YMYL guides older than 90 days are still un-verified after
  this run (candidates minus this batch). This surfaces backlog growth honestly — never
  hide a cap silently.

## Guardrails

- Bump `updated` **only** on a genuine content change. Never touch it just to look fresh —
  a lying `dateModified` hurts SEO and trust.
- Touch only the four files listed above.
- `tsc --noEmit` must pass after your edits (the workflow gates on it) — keep the array
  syntax valid, strings escaped, EN/RU counts unchanged.
- Be honest in the digest: report `ok`, `needs-human`, and the remaining queue truthfully.
