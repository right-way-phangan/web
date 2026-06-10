# GTM container — Right Way Phangan (Web)

Ready-to-import Google Tag Manager container that wires the site's dataLayer
events (`lead_submit`, `view_listing`, `telegram_click`, `whatsapp_click`,
`phone_click`, `email_click`, `roi_complete`) to **GA4** and **Meta Pixel**.

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
- **GA4** → Admin → Events → mark `generate_lead` as a **key event** (conversion).
- **Google Ads** (when the account exists) → import GA4 `generate_lead` as a
  conversion, or add a Google Ads conversion tag here referencing the same trigger.
- **Meta** → Events Manager will show `Lead` / `ViewContent` / `Contact` /
  custom `ROIComplete` automatically once the Pixel id is live.

GA4 + Meta both load via Custom HTML tags (gtag + fbq) for maximum import safety
across GTM template versions. Swap to native GA4 tags later if preferred.
