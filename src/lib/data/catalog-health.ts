import "server-only";
import { getAllObjects } from "./objects";
import type { RealEstateObject } from "@/types/object";

/**
 * Здоровье каталога — проверки данных объектов, которые тихо ломают сайт или
 * снижают доверие: пустая дата (ломала prerender sitemap), Active без фото
 * (скрыт с сайта), кириллица в EN-полях (утечка на публичный сайт) и т.п.
 * Профилактика багов вроде Invalid Date + операционный список «что дочистить».
 * Чистые проверки над getAllObjects(); юниты off-plan (RW-P####-#) пропускаем —
 * данные ведём по родительскому проекту.
 */

export type HealthSeverity = "critical" | "warn";

export interface HealthCheck {
  key: string;
  label: string;
  severity: HealthSeverity;
  hint: string;
  objects: { rwNumber: string; titleEn: string; status: string }[];
}

export interface CatalogHealth {
  checked: number;
  okObjects: number;
  checks: HealthCheck[];
}

const isUnit = (rw: string): boolean => /^RW-P\d+-\d+$/i.test(rw);
const hasCyrillic = (s?: string): boolean => !!s && /[а-яё]/i.test(s);
const noArea = (o: RealEstateObject): boolean =>
  o.areaRai == null && o.areaSqm == null && !o.areaNote;

interface CheckDef {
  key: string;
  label: string;
  severity: HealthSeverity;
  hint: string;
  fail: (o: RealEstateObject) => boolean;
}

// Проверки применяются к объектам «в обороте» (Active/Reserved/Hold) — у
// Archive/Sold пробелы не критичны. Кириллица проверяется и шире (любая утечка).
const CHECKS: CheckDef[] = [
  {
    key: "active-no-photo",
    label: "Active без фото-обложки",
    severity: "critical",
    hint: "Объект скрыт с сайта (hero обещает фото). Залить обложку в карточку.",
    fail: (o) => o.status === "Active" && !o.coverImage,
  },
  {
    key: "no-date",
    label: "Нет даты добавления",
    severity: "critical",
    hint: "Пустой DATE_ADDED ломал prerender sitemap; влияет на сортировку и бейдж New.",
    fail: (o) => !o.dateAdded,
  },
  {
    key: "cyrillic-en",
    label: "Кириллица в EN-полях",
    severity: "critical",
    hint: "Название/описание уходят на сайт дословно — кириллица и омоглифы утекают публично.",
    fail: (o) => hasCyrillic(o.titleEn) || hasCyrillic(o.descriptionRaw),
  },
  {
    key: "no-coords",
    label: "Нет координат",
    severity: "warn",
    hint: "Объект не появится на карте /listings.",
    fail: (o) => o.lat == null || o.lng == null,
  },
  {
    key: "no-area",
    label: "Нет площади",
    severity: "warn",
    hint: "Клиент не видит размер участка/виллы.",
    fail: noArea,
  },
  {
    key: "no-district",
    label: "Нет района",
    severity: "warn",
    hint: "Не попадёт в фильтры и перелинковку район↔объект.",
    fail: (o) => !o.district,
  },
  {
    key: "no-doc-type",
    label: "Нет типа документа",
    severity: "warn",
    hint: "Chanote/NS3 нужен для DD и доверия покупателя.",
    fail: (o) => !o.documentType,
  },
  {
    key: "no-docs",
    label: "Нет документа в DOCS",
    severity: "warn",
    hint: "L1 Listing Vetting требует копию титула в DOCS.",
    fail: (o) => (o.docs?.length ?? 0) === 0,
  },
];

export async function getCatalogHealth(): Promise<CatalogHealth> {
  const inPlay = (await getAllObjects()).filter(
    (o) => !isUnit(o.rwNumber) && ["Active", "Reserved", "Hold"].includes(o.status),
  );

  const flagged = new Set<string>();
  const checks: HealthCheck[] = CHECKS.map((c) => {
    const objects = inPlay
      .filter(c.fail)
      .map((o) => {
        flagged.add(o.rwNumber);
        return { rwNumber: o.rwNumber, titleEn: o.titleEn, status: o.status };
      })
      .sort((a, b) => a.rwNumber.localeCompare(b.rwNumber));
    return { key: c.key, label: c.label, severity: c.severity, hint: c.hint, objects };
  })
    .filter((c) => c.objects.length > 0)
    .sort((a, b) => {
      const rank = (s: HealthSeverity) => (s === "critical" ? 0 : 1);
      return rank(a.severity) - rank(b.severity) || b.objects.length - a.objects.length;
    });

  return { checked: inPlay.length, okObjects: inPlay.length - flagged.size, checks };
}
