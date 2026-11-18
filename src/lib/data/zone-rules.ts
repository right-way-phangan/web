/**
 * Indicative building rules from a plot's detected zone + what we know about
 * the plot. The map auto-classifies the DPT city-plan colour (zone-lookup.ts:
 * Green/Yellow/Orange/Red/Purple); this turns that classification into a
 * plain-language "what you can build here" for the public object page.
 *
 * Deliberately indicative, never invented:
 *  - The DPT colour is a LAND-USE zone → it tells us permitted use + density.
 *  - HEIGHT / SETBACKS come from a separate overlay — the May-2025 Phangan
 *    environmental zones, keyed off proximity to the sea and slope. We only
 *    surface those where a plot flag tells us they apply (beachfront / sea
 *    view / mountain view).
 *  - Every figure here is sourced from Right Way's own vetted content (FAQ /
 *    Knowledge Base / Due Diligence). No FAR/footprint percentages are stated
 *    because we don't have an authoritative per-zone number — those are
 *    confirmed in Transaction DD. The UI always shows that caveat.
 */

import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";

export type RuleLocale = Locale;

export interface ZoneBuildInfo {
  /** Localized zone name, e.g. "Low-density residential". Omitted if unknown. */
  zone?: string;
  /** Labelled lines: permitted use, typical build form, permit. */
  lines: { label: string; text: string }[];
  /**
   * "Check before you build" flags from what we know about the plot — the DD
   * differentiator ("we tell you what you can't build"). `warn` = a real
   * buildability constraint; `info` = softer, verify in DD.
   */
  flags: { level: "warn" | "info"; text: string }[];
}

type Bi = { en: string; ru: string; th: string };
const pick = (b: Bi, l: RuleLocale) => b[l];

/** DPT land-use colour → permitted use + density (plain language). */
const ZONE_USE: Record<string, { name: Bi; use: Bi }> = {
  green: {
    name: { en: "Rural & agricultural", ru: "Сельская/сельхоз", th: "พื้นที่ชนบทและเกษตรกรรม" },
    use: {
      en: "Low-density homes and agritourism. A private villa is typically allowed; dense or commercial development is not.",
      ru: "Жильё низкой плотности и агротуризм. Частная вилла обычно допустима; плотная или коммерческая застройка — нет.",
      th: "ที่อยู่อาศัยความหนาแน่นต่ำและการท่องเที่ยวเชิงเกษตร โดยทั่วไปสร้างวิลล่าส่วนตัวได้ แต่ไม่อนุญาตการพัฒนาหนาแน่นหรือเชิงพาณิชย์",
    },
  },
  // The three greens of the Phangan plan differ in what they allow — keyed by
  // the finer colour class (PlanZone), so "green" alone never speaks for all.
  greenlight: {
    name: { en: "Open space / recreation", ru: "Открытые пространства / рекреация", th: "ที่โล่ง / นันทนาการ" },
    use: {
      en: "A protection zone that still allows a private home: recreation, farming, one detached house per plot. Subdivisions, terraced houses, condos and dormitories are banned outright.",
      ru: "Охранная зона, где частный дом всё же разрешён: рекреация, сельское хозяйство, отдельно стоящий дом. Раздел под застройку, таунхаусы, кондоминиумы и общежития запрещены прямо.",
      th: "เขตอนุรักษ์ที่ยังสร้างบ้านส่วนตัวได้: นันทนาการ เกษตรกรรม และบ้านเดี่ยวหนึ่งหลังต่อแปลง ห้ามจัดสรรที่ดิน ทาวน์เฮาส์ คอนโด และหอพักโดยเด็ดขาด",
    },
  },
  greenbright: {
    name: { en: "Forest conservation", ru: "Лесная консервация", th: "อนุรักษ์ป่าไม้" },
    use: {
      en: "Forest protection zone. On privately held land a detached home is allowed, but housing may take at most 30% of the plot.",
      ru: "Зона охраны леса. На частной земле отдельно стоящий дом разрешён, но под жильё — не более 30% участка.",
      th: "เขตอนุรักษ์ป่าไม้ บนที่ดินกรรมสิทธิ์เอกชนสร้างบ้านเดี่ยวได้ แต่พื้นที่อยู่อาศัยต้องไม่เกิน 30% ของแปลง",
    },
  },
  yellow: {
    name: { en: "Low-density residential", ru: "Жилая, низкая плотность", th: "ที่อยู่อาศัยหนาแน่นน้อย" },
    use: {
      en: "Houses and villas — the most build-friendly zone for a private home.",
      ru: "Дома и виллы — самая «застраиваемая» зона под частный дом.",
      th: "บ้านและวิลล่า — เขตที่สร้างบ้านส่วนตัวได้ง่ายที่สุด",
    },
  },
  orange: {
    name: { en: "Medium-density residential", ru: "Жилая, средняя плотность", th: "ที่อยู่อาศัยหนาแน่นปานกลาง" },
    use: {
      en: "Houses, villas and small multi-unit buildings; higher density than the low-density zone.",
      ru: "Дома, виллы, небольшие многоквартирные; плотность выше, чем в зоне низкой плотности.",
      th: "บ้าน วิลล่า และอาคารหลายยูนิตขนาดเล็ก ความหนาแน่นสูงกว่าเขตหนาแน่นน้อย",
    },
  },
  red: {
    name: { en: "Commercial", ru: "Коммерческая", th: "พาณิชยกรรม" },
    use: {
      en: "Shops, hospitality and mixed-use. Housing is secondary here.",
      ru: "Торговля, гостеприимство, смешанное использование. Жильё здесь вторично.",
      th: "ร้านค้า ธุรกิจบริการ และการใช้ประโยชน์ผสม ที่อยู่อาศัยเป็นเรื่องรอง",
    },
  },
  purple: {
    name: { en: "Industrial", ru: "Промышленная", th: "อุตสาหกรรม" },
    use: {
      en: "Warehousing and light industry — not intended for housing.",
      ru: "Склады и лёгкая промышленность — под жильё не предназначена.",
      th: "คลังสินค้าและอุตสาหกรรมเบา — ไม่ได้มีไว้สำหรับที่อยู่อาศัย",
    },
  },
};

const TYPICAL_FORM: Bi = {
  en: "A typical Phangan residential build is 1–2 storeys (often 1.5 to lift the sea view), with a pool and garden.",
  ru: "Типовая жилая застройка на Пангане — 1–2 этажа (часто 1,5, чтобы поднять вид на море), бассейн и сад.",
  th: "บ้านพักอาศัยทั่วไปบนเกาะพะงันสูง 1–2 ชั้น (มักเป็น 1.5 ชั้นเพื่อยกระดับวิวทะเล) พร้อมสระว่ายน้ำและสวน",
};

const PERMIT: Bi = {
  en: "Building permit is issued by the local Tessaban; an environmental assessment is required for builds over 500 m².",
  ru: "Разрешение на строительство выдаёт местный тессабан; для строений свыше 500 м² требуется экологическая оценка.",
  th: "ใบอนุญาตก่อสร้างออกโดยเทศบาลในพื้นที่ อาคารที่ใหญ่กว่า 500 ตร.ม. ต้องผ่านการประเมินผลกระทบสิ่งแวดล้อม",
};

const COASTAL: Bi = {
  en: "Coastal zone: within ~200 m of the high-water line height is typically capped near 6 m with a reduced footprint and no commercial use on residential plots; within ~50 m only small single-storey buildings.",
  ru: "Прибрежная зона: в ~200 м от линии прилива высота обычно ограничена ~6 м, пятно застройки уменьшено, коммерция на жилых участках запрещена; в ~50 м — только небольшие одноэтажные строения.",
  th: "เขตชายฝั่ง: ภายใน ~200 ม. จากแนวน้ำขึ้นสูงสุด โดยทั่วไปจำกัดความสูงประมาณ 6 ม. ลดพื้นที่อาคาร และห้ามใช้เชิงพาณิชย์บนแปลงที่อยู่อาศัย ภายใน ~50 ม. สร้างได้เฉพาะอาคารชั้นเดียวขนาดเล็ก",
};

const HILLSIDE: Bi = {
  en: "Hillside (Mountain zone): slope-based limits, road-access requirements and environmental approvals may apply.",
  ru: "Склон (Горная зона): возможны ограничения по уклону, требования к подъездной дороге и экологические согласования.",
  th: "พื้นที่ลาดเขา (เขตภูเขา): อาจมีข้อจำกัดตามความลาดชัน ข้อกำหนดเรื่องทางเข้า และการอนุมัติด้านสิ่งแวดล้อม",
};

const NEAR_COAST: Bi = {
  en: "Near the coast — coastal height caps and setbacks may apply; confirmed against the plot's exact distance to the water in DD.",
  ru: "Рядом с морем — могут действовать прибрежные ограничения высоты и отступы; уточняется по точному расстоянию участка до воды в DD.",
  th: "ใกล้ชายฝั่ง — อาจมีข้อจำกัดความสูงและระยะร่นของเขตชายฝั่ง ยืนยันตามระยะจริงจากแปลงถึงทะเลในการตรวจสอบสถานะ (DD)",
};

const ROAD_ACCESS: Bi = {
  en: "Access is an unpaved/no road — a building permit needs a legal road access; confirm right-of-way in DD.",
  ru: "Подъезд — грунтовка/без дороги — для разрешения нужен легальный доступ; проверяем право проезда (сервитут) в DD.",
  th: "ทางเข้าเป็นถนนดิน/ไม่มีถนน — การขอใบอนุญาตก่อสร้างต้องมีทางเข้าที่ถูกกฎหมาย ตรวจสอบภาระจำยอม (สิทธิทางผ่าน) ใน DD",
};

const PROTECTED_USE: Bi = {
  en: "Protection zone — build one house for yourself, not a project: no plot subdivision for sale, no terraced houses, condos or dormitories. Confirm the zone number against the land office map in DD.",
  ru: "Охранная зона — дом для себя, но не проект: нельзя делить участок под продажу, строить таунхаусы, кондоминиумы и общежития. Номер зоны сверяем по карте земельного офиса в DD.",
  th: "เขตอนุรักษ์ — สร้างบ้านหนึ่งหลังสำหรับตัวเองได้ แต่ไม่ใช่โครงการ: ห้ามแบ่งแปลงขาย ห้ามสร้างทาวน์เฮาส์ คอนโด หรือหอพัก ตรวจสอบหมายเลขเขตกับแผนที่ของสำนักงานที่ดินใน DD",
};

const AGRI_USE: Bi = {
  en: "Agricultural zone — confirm a private villa is permitted (and the title is not Sor Por Kor, which can't be built on).",
  ru: "Сельхоз-зона — подтверждаем, что частная вилла разрешена (и что документ не Сор Пор Кор, на котором строить нельзя).",
  th: "เขตเกษตรกรรม — ยืนยันว่าสร้างวิลล่าส่วนตัวได้ (และเอกสารสิทธิ์ไม่ใช่ ส.ป.ก. ซึ่งสร้างอาคารไม่ได้)",
};

/**
 * Plot signals that refine the zone's indicative rules — all optional. The
 * standalone location checker (no saved object yet) leaves them off unless the
 * user ticks them; an object page fills them from the listing's own fields.
 */
export interface ZoneSignals {
  /** Object type — "Land" (or unset, for the standalone checker) shows the
   *  "typical build" + permit lines that only make sense for a vacant plot. */
  type?: string;
  beachfront?: boolean;
  seaView?: boolean;
  mountainView?: boolean;
  /** "Dirt" | "None" | "Concrete" | … — only dirt/none raise the access flag. */
  roadType?: string;
}

/**
 * Indicative rules from a DPT zone key (green/yellow/orange/red/purple) plus
 * whatever plot signals we know. Shared core: the object page calls it via
 * zoneBuildInfo, the standalone location-zoning checker calls it directly.
 * Null when there's nothing useful to say (unknown zone and no
 * coastal/hillside/access signal).
 */
export function zoneRulesFromSignals(
  zoneKey: string,
  signals: ZoneSignals,
  locale: RuleLocale,
): ZoneBuildInfo | null {
  const key = (zoneKey ?? "").trim().toLowerCase();
  const zoneDef = ZONE_USE[key];
  // Standalone checker (type unset) is about an empty plot's buildability, so
  // treat it as Land; an object page passes its real type, preserving behaviour.
  const isLand = signals.type === "Land" || signals.type == null;

  const lines: { label: string; text: string }[] = [];
  const flags: { level: "warn" | "info"; text: string }[] = [];

  const L = {
    en: { use: "Permitted use", form: "Typical build", permit: "Permit" },
    ru: { use: "Использование", form: "Типовая застройка", permit: "Разрешение" },
    th: { use: "การใช้ประโยชน์ที่อนุญาต", form: "รูปแบบอาคารทั่วไป", permit: "ใบอนุญาต" },
  }[locale];

  if (zoneDef) {
    lines.push({ label: L.use, text: pick(zoneDef.use, locale) });
    // "What you can build" form line only makes sense for a vacant plot.
    if (isLand && (key === "green" || key === "yellow" || key === "orange")) {
      lines.push({ label: L.form, text: pick(TYPICAL_FORM, locale) });
    }
  }

  // "Check before you build" flags — only from signals we actually have.
  if (signals.beachfront) flags.push({ level: "warn", text: pick(COASTAL, locale) });
  else if (signals.seaView) flags.push({ level: "info", text: pick(NEAR_COAST, locale) });
  if (signals.mountainView) flags.push({ level: "warn", text: pick(HILLSIDE, locale) });
  if (signals.roadType === "Dirt" || signals.roadType === "None") {
    flags.push({ level: "warn", text: pick(ROAD_ACCESS, locale) });
  }
  if (key === "green") flags.push({ level: "info", text: pick(AGRI_USE, locale) });
  if (key === "greenlight" || key === "greenbright") {
    flags.push({ level: "warn", text: pick(PROTECTED_USE, locale) });
  }

  if (lines.length === 0 && flags.length === 0) return null;

  // Permit note is worth showing whenever we're saying anything about building.
  if (isLand) lines.push({ label: L.permit, text: pick(PERMIT, locale) });

  return { zone: zoneDef ? pick(zoneDef.name, locale) : undefined, lines, flags };
}

/**
 * Build the indicative rule set for an object, or null if we can say nothing
 * useful (no zone and no coastal/hillside signal). Thin wrapper feeding the
 * listing's own fields into the shared zoneRulesFromSignals core.
 */
export function zoneBuildInfo(o: RealEstateObject, locale: RuleLocale): ZoneBuildInfo | null {
  return zoneRulesFromSignals(
    o.zone ?? "",
    {
      type: o.type,
      beachfront: o.beachfront,
      seaView: o.seaView,
      mountainView: o.mountainView,
      roadType: o.roadType,
    },
    locale,
  );
}

/**
 * A synthesized "Can I build on RW-XXXX?" Q&A for the listing FAQ — plain-text
 * paragraphs (good for FAQPage JSON-LD + LLM answer engines / GEO-AEO). Built
 * from the same indicative data as the visible block; null when we have nothing
 * to say. The answer never asserts hard figures — it points to DD.
 */
export function buildabilityFaq(
  o: RealEstateObject,
  locale: RuleLocale,
): { question: string; answer: string[] } | null {
  const info = zoneBuildInfo(o, locale);
  if (!info) return null;

  const rw = o.rwNumber;
  const where = o.district
    ? pick({ en: ` in ${o.district}`, ru: ` в районе ${o.district}`, th: ` ใน${o.district}` }, locale)
    : "";
  const question = pick(
    {
      en: `Can I build on ${rw}${where}?`,
      ru: `Можно ли строить на участке ${rw}${where}?`,
      th: `สร้างบ้านบน ${rw}${where} ได้หรือไม่?`,
    },
    locale,
  );

  const answer: string[] = [];
  answer.push(
    info.zone
      ? pick(
          {
            en: `${rw} is in a ${info.zone.toLowerCase()} zone.`,
            ru: `${rw} находится в зоне «${info.zone}».`,
            th: `${rw} อยู่ในเขต “${info.zone}”`,
          },
          locale,
        )
      : pick(
          {
            en: `The city-plan zone for ${rw} is not yet classified — confirmed in DD.`,
            ru: `Зона участка ${rw} ещё не классифицирована по карте — уточняется в DD.`,
            th: `ยังไม่ได้จำแนกเขตผังเมืองของ ${rw} — ยืนยันใน DD`,
          },
          locale,
        ),
  );
  for (const line of info.lines) answer.push(line.text);
  if (info.flags.length) {
    const lead = pick(
      { en: "Before you build, check: ", ru: "Перед стройкой проверьте: ", th: "ก่อนก่อสร้าง ตรวจสอบ: " },
      locale,
    );
    answer.push(lead + info.flags.map((f) => f.text).join(" "));
  }
  answer.push(
    pick(
      {
        en: "Exact height, footprint, setbacks and permitted use are confirmed in our due diligence before any deal.",
        ru: "Точные высота, пятно застройки, отступы и разрешённое использование подтверждаются в нашем Due Diligence до сделки.",
        th: "ความสูง พื้นที่อาคาร ระยะร่น และการใช้ประโยชน์ที่แน่นอน จะได้รับการยืนยันในการตรวจสอบสถานะ (Due Diligence) ของเราก่อนทำธุรกรรม",
      },
      locale,
    ),
  );
  return { question, answer };
}

/** Short localized zone name for compare (e.g. "Low-density residential"). */
export function zoneShort(o: RealEstateObject, locale: RuleLocale): string | null {
  const def = ZONE_USE[(o.zone ?? "").trim().toLowerCase()];
  return def ? pick(def.name, locale) : null;
}

const ZONE_CAT: Record<string, Bi> = {
  green: { en: "Agricultural", ru: "Сельхоз", th: "เกษตรกรรม" },
  yellow: { en: "Residential", ru: "Жилая", th: "ที่อยู่อาศัย" },
  orange: { en: "Residential", ru: "Жилая", th: "ที่อยู่อาศัย" },
  red: { en: "Commercial", ru: "Коммерч.", th: "พาณิชย์" },
  purple: { en: "Industrial", ru: "Пром.", th: "อุตสาหกรรม" },
};

/** One-word zone category for the tight listing-card meta row. */
export function zoneCategory(o: RealEstateObject, locale: RuleLocale): string | null {
  const c = ZONE_CAT[(o.zone ?? "").trim().toLowerCase()];
  return c ? pick(c, locale) : null;
}

const WARN_SHORT = {
  coastal: { en: "Coastal limits", ru: "Прибрежные", th: "ชายฝั่ง" },
  hillside: { en: "Hillside", ru: "Склон", th: "ลาดเขา" },
  road: { en: "Access road", ru: "Подъезд", th: "ทางเข้า" },
} as const;

/**
 * Short "check before building" warning tags for cards / compare — only the
 * hard (warn-level) signals we actually have: coastal, hillside, road access.
 */
export function buildWarnLabels(o: RealEstateObject, locale: RuleLocale): string[] {
  const out: string[] = [];
  if (o.beachfront) out.push(pick(WARN_SHORT.coastal, locale));
  if (o.mountainView) out.push(pick(WARN_SHORT.hillside, locale));
  if (o.roadType === "Dirt" || o.roadType === "None") out.push(pick(WARN_SHORT.road, locale));
  return out;
}
