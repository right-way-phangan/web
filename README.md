# Right Way Phangan — Web (MVP)

Next.js 15 site for [rightwaygroup.co](https://rightwaygroup.co). Replaces the legacy Laravel/Livewire site. Built 2026-06.

## Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + Server Actions, native AI integration paths |
| Language | TypeScript strict | Type safety end-to-end |
| Styling | Tailwind CSS 3 + custom palette | Fast, premium-capable, design-system friendly |
| UI primitives | shadcn/ui + Radix | Accessible, composable, no lock-in |
| Fonts | Inter (sans) + Cormorant Garamond (serif) | Warm premium |
| Hosting | Vercel (Hobby → Pro) | Auto-deploy, preview branches, zero ops |
| Catalog data | amoCRM API (catalog 9077) | CRM is source of truth |
| Photos | Vercel Blob → Cloudflare R2 (later) | Cheap CDN |
| Content | MDX in repo (Vladimir edits via Claude) | No CMS until needed |
| Forms | Server Actions → amoCRM POST /leads | Direct, no middleware |
| Analytics | Plausible or Vercel Analytics | Privacy-friendly |

## Architecture

```
                ┌──────────────────────┐
                │  Browser (visitor)   │
                └──────────┬───────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │      Next.js (Vercel SSR/ISR)    │
        │  · MDX content (in-repo)         │
        │  · /listings, /object/[id]       │
        │  · Server Actions (forms)        │
        └──────┬─────────────────────┬─────┘
               │ read                │ write
               ▼                     ▼
        ┌────────────────┐    ┌──────────────────┐
        │  amoCRM v4 API │    │  amoCRM v4 API   │
        │  /catalogs/    │    │  /leads/complex  │
        │  9077/elements │    │  (form submits)  │
        └────────────────┘    └──────────────────┘

  Photos served from Vercel Blob (Drive URLs cached + optimized)
```

## Folder structure

```
web/
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── layout.tsx           # root layout, fonts
│   │   ├── page.tsx             # / (home)
│   │   ├── listings/            # /listings catalog
│   │   ├── object/[rw]/         # /object/RW-L0001
│   │   ├── districts/           # /districts and /districts/[slug]
│   │   ├── about/               # /about, /process, /services
│   │   ├── faq/                 # /faq
│   │   └── api/                 # API routes (webhooks if needed)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives
│   │   └── sections/            # composed sections (Hero, Listings grid, ...)
│   ├── lib/
│   │   ├── amocrm/
│   │   │   ├── env.ts           # zod-validated env
│   │   │   ├── client.ts        # API client (server-only)
│   │   │   ├── mapper.ts        # amoCRM → domain
│   │   │   └── types.ts         # amoCRM raw types
│   │   └── utils/cn.ts          # tailwind class merger
│   ├── content/
│   │   ├── pages/               # MDX for static pages
│   │   ├── districts/           # MDX for each district
│   │   └── faq/                 # MDX for FAQ
│   └── types/
│       └── object.ts            # domain type: RealEstateObject
├── public/
│   ├── images/                  # static images
│   └── fonts/                   # self-hosted fonts (optional)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
└── README.md
```

## First-run

1. Install Node LTS (nvm recommended)
2. From `web/`:
   ```bash
   cp .env.example .env.local
   # fill AMOCRM_TOKEN — see bot/.env or amoCRM long-lived token
   npm install
   npm run dev
   # → http://localhost:3000
   ```
3. First page renders home placeholder. Listings will be wired Day 3 per plan.

## Connection to existing infra

| Existing system | How web/ uses it |
|---|---|
| amoCRM catalog 9077 | Source of truth for objects (listings + detail) |
| amoCRM pipelines 7508490 (Land) / 10966398 (Villa/House) | Form submissions create leads here |
| `bot/scripts/amocrm_backup.py` | Provides field schema; web maps `field_code` → domain |
| `bot/scripts/auto_tag_photos.py` → `analytics/photo_tags.json` | Source for cover + gallery (sync job TBD) |
| Google Drive (Circle folders + RW folders) | Photos origin; mirrored to Vercel Blob |
| intake bot + assistant bot | Independent; share data via amoCRM only |
| Telegram channel `@rightwayphangan` | Linked in nav + object detail pages |

## What's NOT in MVP (volume 2)

- AI search ("show me land under 5M with sunset view")
- AI assistant on object detail
- Saved searches / favorites (requires auth)
- RU localization
- Blog
- Headless CMS (Sanity) — added when Vladimir wants self-edit
- Advanced market analytics (price trends per district)

## Conventions

- All public-facing copy in **English** only (RU later)
- **Never mention price segment** (15-50M) in public copy
- Object numbering per [project memory](../bot/scripts/README.md): `RW-L/V/A/P + NNNN`
- Lead routing by page context: Land pages → pipeline 7508490, Villa/House pages → 10966398
