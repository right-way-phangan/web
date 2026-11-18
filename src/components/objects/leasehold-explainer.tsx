import Link from "next/link";
import type { Route } from "next";
import { KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { Locale } from "@/lib/i18n/dictionaries";
import { L, localeBase, localePath } from "@/lib/i18n/locale-path";
import { Button } from "@/components/ui/button";
import { Appear } from "@/components/motion/appear";

/**
 * Lease-term pill for the object header — "30-year lease" — shown whenever the
 * listing carries a concrete lease term, so a browsing buyer sees the horizon
 * next to the Vetted badge without opening the spec table.
 */
export function LeaseTermBadge({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  const years = object.leaseTermYears;
  if (!years) return null;
  const label = L(locale, { en: `${years}-year lease`, ru: `Лизинг ${years} лет`, th: `สิทธิการเช่า ${years} ปี` });
  return (
    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brass-500/30 bg-brass-500/[0.08] px-2.5 py-0.5 text-xs font-medium text-forest-700">
      <ScrollText className="h-3.5 w-3.5 text-brass-500" aria-hidden />
      {label}
    </span>
  );
}

const COPY = {
  en: {
    heading: "How leasehold works here",
    body: "Foreigners can't own land outright on Koh Phangan — but you can own the building and hold the land on a long-term lease, the route most international buyers use. The house is registered in your name; the land sits on the lease.",
    model: "Model this lease",
    learn: "How leasehold works",
    horizon: "Lease horizon",
    year0: "Year 0",
    registered: "Lease registered at the Land Office",
  },
  ru: {
    heading: "Как здесь устроен лизхолд",
    body: "Иностранец не может владеть землёй на Пангане напрямую — но может владеть строением и держать землю в долгосрочном лизинге, как и делает большинство зарубежных покупателей. Дом оформлен на вас; земля — на лизинге.",
    model: "Посчитать лизинг",
    learn: "Как работает лизхолд",
    horizon: "Горизонт лизинга",
    year0: "Год 0",
    registered: "Лизинг зарегистрирован в Земельном офисе",
  },
  th: {
    heading: "สิทธิการเช่า (ลีสโฮลด์) ที่นี่ทำงานอย่างไร",
    body: "ชาวต่างชาติไม่สามารถถือกรรมสิทธิ์ที่ดินบนเกาะพะงันได้โดยตรง แต่สามารถเป็นเจ้าของสิ่งปลูกสร้างและถือที่ดินผ่านสัญญาเช่าระยะยาวได้ ซึ่งเป็นวิธีที่ผู้ซื้อต่างชาติส่วนใหญ่ใช้ บ้านจดทะเบียนในชื่อของคุณ ส่วนที่ดินอยู่ภายใต้สัญญาเช่า",
    model: "คำนวณสัญญาเช่านี้",
    learn: "สิทธิการเช่าทำงานอย่างไร",
    horizon: "ระยะเวลาสัญญาเช่า",
    year0: "ปีที่ 0",
    registered: "จดทะเบียนสัญญาเช่าที่สำนักงานที่ดินแล้ว",
  },
} as const;

/**
 * Leasehold ownership-structure explainer for the object page — shown only for
 * listings offered on leasehold. Complements BuildingRules (physical build
 * limits) by answering the ownership question ("you own the house, lease the
 * land") and deep-links the leasehold calculator prefilled with this plot's
 * term, plus the /leasehold explainer.
 */
export function LeaseholdStructure({
  object,
  locale,
}: {
  object: RealEstateObject;
  locale: Locale;
}) {
  if (!object.tenure?.includes("Leasehold")) return null;
  const t = COPY[locale];
  const years = object.leaseTermYears;
  const calcHref = (`${localeBase(locale)}/calculator?tenure=leasehold${
    years ? `&lease=${years}` : ""
  }`) as Route;
  const leaseHref = localePath(locale, "/leasehold") as Route;
  return (
    <Appear>
      <section className="rounded-lg border border-forest-500/15 bg-forest-500/[0.03] p-5 md:p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brass-500" aria-hidden />
          <h2 className="font-serif text-2xl text-forest-900">{t.heading}</h2>
        </div>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-forest-500/85">{t.body}</p>
        {years ? (
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-xs font-medium text-forest-500/70">
              <span>{t.horizon}</span>
              <span>{L(locale, { en: `${years} years`, ru: `${years} лет`, th: `${years} ปี` })}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] text-forest-500/60">{t.year0}</span>
              <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-brass-500/70 to-brass-500/15" />
              <span className="text-[10px] text-forest-500/60">
                {L(locale, { en: `Year ${years}`, ru: `Год ${years}`, th: `ปีที่ ${years}` })}
              </span>
            </div>
          </div>
        ) : null}
        {object.leaseRegistered === true ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700">
            <ShieldCheck className="h-4 w-4 text-brass-500" aria-hidden />
            {t.registered}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={calcHref}>{t.model} →</Link>
          </Button>
          <Link
            href={leaseHref}
            className="text-sm font-medium text-brass-600 underline-offset-2 transition-colors hover:text-brass-700 hover:underline"
          >
            {t.learn}
          </Link>
        </div>
      </section>
    </Appear>
  );
}
