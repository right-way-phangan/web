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
  /**
   * RW-#### of a published catalog *object* (not a project) → the entry links
   * to its object page. Use when the developer's own house is for sale with us.
   */
  objectRw?: string;
}

export interface DeveloperFact {
  label: Localized;
  value: Localized;
}

/** One project's photo set — rendered as its own carousel inside the gallery block. */
export interface DeveloperPhotoSet {
  /** Project brand name — not localized. */
  title: string;
  /** Secondary line under the title, e.g. "Delivered · Nai Wok". */
  note?: Localized;
  /**
   * Paths under /public. Every entry needs a `-sm.webp` sibling (the carousel
   * shows the thumb, the lightbox the full frame) — see `estateThumb`.
   */
  photos: string[];
}

/** A project pin for the developer's mini-map. */
export interface DeveloperLocation {
  /** Project brand name — not localized. */
  title: string;
  lat: number;
  lng: number;
  /** Short clarifier in the pin's popup, e.g. "Delivered · 6 villas". */
  note?: Localized;
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
  /** Vetted project photos, grouped by project — renders the "Projects in photos" block when present. */
  gallery?: DeveloperPhotoSet[];
  /** Project pins — renders the mini-map when there are two or more. */
  locations?: DeveloperLocation[];
  seo?: { title?: Localized; description?: Localized };
}

export type ResolvedTimelineEntry = DeveloperTimelineEntry & { href?: string };
