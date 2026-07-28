# GTM container — Right Way Phangan (Web)

Ready-to-import Google Tag Manager container that wires the site's dataLayer
events (`lead_submit`, `view_listing`, `telegram_click`, `whatsapp_click`,
`phone_click`, `email_click`, `roi_complete`) to **GA4** and **Meta Pixel**.

Everything else the site emits — forms, search, estimate tools, RW Match,
estate lots, project CTAs (22 events) — reaches GA4 through a single catch-all
tag, `EVT - soft (GA4)`, whose regex trigger takes the event name from
`{{Event}}`. Two deliberate exclusions: `inquiry_submitted` is not wired at all
(forms fire it alongside `lead_submit`, so a tag on both would double-count
leads), and the `project_*` / `estate_lot_*` messenger events go to GA4 only —
they are plain `wa.me`/`t.me` links that `contact-click-tracker.tsx` already
reports as `whatsapp_click`/`telegram_click` → `fbq Contact`. Meta additionally
receives `HighIntent` for `public_estimate`, `rate_check` and `match_done`, the
strongest intent signals we have (useful as a lookalike seed).

The dataLayer events are emitted by the site code (`src/lib/analytics/track.ts`,
`src/components/analytics/*`). GTM itself loads only when `NEXT_PUBLIC_GTM_ID` is
set in Vercel — until then everything ships dark.

## Install (≈10 min, one-time)

1. **tagmanager.google.com** → create account + a **Web** container → copy its
   `GTM-XXXXXXX` id.
2. **Admin → Import Container** → upload `right-way-container.json` → choose the
   **Default** workspace → **Merge → Overwrite**. This creates all tags,
   triggers and variables.
3. **Variables** → open `GA4_MEASUREMENT_ID`, paste your GA4 id (`G-…`); open
   `META_PIXEL_ID`, paste your Pixel id. (These two are the only edits needed.)
4. **Preview** (Tag Assistant) on https://rightwaygroup.co → submit a test lead,
   open an object, click Telegram/WhatsApp — confirm the EVT tags fire.
5. **Submit / Publish** the workspace.
6. Set **`NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`** in Vercel (Production) → redeploy.

## Then, outside GTM
- **GA4** → Admin → **Key events** → New. `generate_lead` will not be in the
  Events list yet (the name is born inside the GTM tag — the site itself emits
  `lead_submit`), so create it **by name**. Add `roi_complete` too, and
  `lead_submit` to keep continuity with the pre-GTM history.
- **GA4** → Admin → Custom definitions → register the event params you want in
  reports (`rw`, `source`, `district`, `type`, `kind`, `method`, `location`,
  `action`). Unregistered params are collected but stay invisible in the UI.
- **Google Ads** (when the account exists) → import GA4 `generate_lead` as a
  conversion, or add a Google Ads conversion tag here referencing the same trigger.
- **Meta** → Events Manager will show `Lead` / `ViewContent` / `Contact` /
  custom `ROIComplete` automatically once the Pixel id is live.

GA4 + Meta both load via Custom HTML tags (gtag + fbq) for maximum import safety
across GTM template versions. Swap to native GA4 tags later if preferred.
