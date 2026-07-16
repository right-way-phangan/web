"use client";

import { useLocale } from "@/lib/i18n/use-locale";
import { ProjectNav, type NavItem } from "@/components/projects/project-nav";

/**
 * Sticky in-page navigation for /insights — reuses the project-landing ProjectNav
 * (scroll-spy + smooth-scroll + mobile chip strip). Chips are scoped to the active
 * audience tab: owners get the rent/income anchors, investors the land/build/report
 * ones. The CTA jumps to that tab's primary action.
 */
const NAV: Record<
  "en" | "ru",
  { owner: NavItem[]; investor: NavItem[]; ctaOwner: string; ctaInvestor: string; ariaLabel: string }
> = {
  en: {
    owner: [
      { id: "rate-check", label: "Rate check" },
      { id: "rents", label: "What homes earn" },
    ],
    investor: [
      { id: "land", label: "Land prices" },
      { id: "build", label: "What to build" },
      { id: "report", label: "Full report" },
    ],
    ctaOwner: "Check my rate",
    ctaInvestor: "Full report",
    ariaLabel: "Insights sections",
  },
  ru: {
    owner: [
      { id: "rate-check", label: "Проверка ставки" },
      { id: "rents", label: "Что зарабатывают" },
    ],
    investor: [
      { id: "land", label: "Цены на землю" },
      { id: "build", label: "Что строить" },
      { id: "report", label: "Полный отчёт" },
    ],
    ctaOwner: "Оценить мой объект",
    ctaInvestor: "Полный отчёт",
    ariaLabel: "Разделы аналитики",
  },
};

export function InsightsNav({ tab }: { tab: "owner" | "investor" }) {
  const nav = NAV[useLocale()];
  const owner = tab === "owner";
  return (
    <ProjectNav
      items={owner ? nav.owner : nav.investor}
      ctaLabel={owner ? nav.ctaOwner : nav.ctaInvestor}
      ctaHref={owner ? "rate-check" : "report"}
      ariaLabel={nav.ariaLabel}
    />
  );
}
