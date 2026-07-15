"use client";

import { useLocale } from "@/lib/i18n/use-locale";
import { ProjectNav, type NavItem } from "@/components/projects/project-nav";

/**
 * Sticky in-page navigation for /insights — reuses the project-landing ProjectNav
 * (scroll-spy + smooth-scroll + mobile chip strip). Chips map to the seven
 * anchor sections; the CTA jumps to the interactive rate estimator.
 */
const NAV: Record<
  "en" | "ru",
  { items: NavItem[]; cta: string; ariaLabel: string }
> = {
  en: {
    items: [
      { id: "pulse", label: "Market pulse" },
      { id: "rate-check", label: "Rate check" },
      { id: "rents", label: "What homes earn" },
      { id: "trust", label: "Trust" },
      { id: "land", label: "Land prices" },
      { id: "build", label: "What to build" },
      { id: "report", label: "Full report" },
    ],
    cta: "Check my rate",
    ariaLabel: "Insights sections",
  },
  ru: {
    items: [
      { id: "pulse", label: "Пульс рынка" },
      { id: "rate-check", label: "Проверка ставки" },
      { id: "rents", label: "Что зарабатывают" },
      { id: "trust", label: "Доверие" },
      { id: "land", label: "Цены на землю" },
      { id: "build", label: "Что строить" },
      { id: "report", label: "Полный отчёт" },
    ],
    cta: "Оценить мой объект",
    ariaLabel: "Разделы аналитики",
  },
};

export function InsightsNav() {
  const nav = NAV[useLocale()];
  return (
    <ProjectNav
      items={nav.items}
      ctaLabel={nav.cta}
      ctaHref="rate-check"
      ariaLabel={nav.ariaLabel}
    />
  );
}
