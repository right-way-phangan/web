/**
 * Curated developer profiles — a content layer over the catalog-derived
 * developer groups (lib/data/projects.ts → getDevelopers()). A profile adds
 * bio, key facts and a cross-project track-record timeline that the catalog
 * cannot express (delivered projects are not for-sale objects).
 *
 * Attribution gate (platform-pivot spec): profiles must NOT contain the
 * developer's own contacts or external links — every CTA goes to our lead form.
 */

export interface Localized {
  en: string;
  ru: string;
}

export type TimelineStatus = "built" | "under-construction" | "planned";

export interface DeveloperTimelineEntry {
  /** Free-form period label ("2022–2024", "Nov 2026"). Omit until confirmed by the developer. */
  year?: string;
  /** Project brand name — not localized. */
  title: string;
  /** Omit until confirmed by the developer — no status pill is rendered then. */
  status?: TimelineStatus;
  description?: Localized;
  /** Secondary clarifier, e.g. "Phase III of Phangaia Garden Resort". */
  note?: Localized;
  /** Path under /public, e.g. "/images/developers/arqa/phangaia.jpg". */
  photo?: string;
  /** RW-P#### of a published catalog project → the entry links to its landing. */
  rwNumber?: string;
}

export interface DeveloperFact {
  label: Localized;
  value: Localized;
}

export interface DeveloperProfile {
  /** Must equal developerSlug(<exact `developer` field value on catalog objects>). */
  slug: string;
  /** Display fallback when no catalog group exists for the slug. */
  name: string;
  /** Paragraphs separated by blank lines ("\n\n"). */
  bio: Localized;
  facts: DeveloperFact[];
  /** Chronological: delivered first, then in-progress / planned. */
  timeline: DeveloperTimelineEntry[];
  hero?: { photo?: string; tagline?: Localized };
  /** Vetted project photos, paths under /public — renders the "Projects in photos" block when present. */
  gallery?: string[];
  /** Logo path under /public — used in Organization JSON-LD when present. */
  logo?: string;
  /** Founding year ("2019") — feeds Organization JSON-LD foundingDate when present. */
  foundingYear?: string;
  seo?: { title?: Localized; description?: Localized };
}

export type ResolvedTimelineEntry = DeveloperTimelineEntry & { href?: string };
