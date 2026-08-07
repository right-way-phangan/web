"use client";

import Link from "next/link";
import type { Route } from "next";
import { Logo } from "./logo";
import { useAppPathname, useIsAdminRoute } from "@/lib/hooks/use-app-pathname";
import {
  siteConfig,
  telegramChannelLink,
  telegramDmLink,
  whatsappLink,
} from "@/lib/site-config";
import { getChromeDict } from "@/lib/i18n/dictionaries";

const currentYear = new Date().getFullYear();

export function Footer() {
  const pathname = useAppPathname();
  const isAdmin = useIsAdminRoute();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");
  const f = chrome.footer;
  // Колонки подвала = те же группы, что и в шапке. Первая собирает основные
  // ссылки бара и группу «Разделы», последняя добирает «Журнал».
  const [exploreGroup, resourcesGroup, companyGroup] = chrome.groups;
  const footerColumns = [
    { label: f.explore, items: [...chrome.nav, ...(exploreGroup?.items ?? [])] },
    { label: resourcesGroup?.label ?? "", items: resourcesGroup?.items ?? [] },
    {
      label: companyGroup?.label ?? "",
      items: [
        ...(companyGroup?.items ?? []),
        { label: f.journal, href: isRu ? "/ru/blog" : "/blog" },
      ],
    },
  ].filter((c) => c.label && c.items.length > 0);
  const creditsHref = (isRu ? "/ru/credits" : "/credits") as Route;
  const creditsLabel = isRu ? "Кредиты фото" : "Photo credits";
  const privacyHref = (isRu ? "/ru/privacy" : "/privacy") as Route;
  const privacyLabel = isRu ? "Конфиденциальность" : "Privacy";

  // The homepage ends on the full-bleed IslandCta band; let the footer sit flush
  // against it instead of floating below a wide cream gap. Other pages close on
  // light content and keep the breathing room.
  const isHome = pathname === "/" || pathname === "/ru";

  // Под CRM маркетинговый подвал не нужен: 21 ссылка на публичные разделы и
  // описание агентства под таблицей лидов — чистый шум. Хедер остаётся.
  if (isAdmin) return null;

  return (
    <footer
      className={`relative border-t border-forest-500/10 bg-cream-200/40 print:hidden ${
        isHome ? "" : "mt-32"
      }`}
    >
      {/* Янтарная градиент-нить поверх рамки — тёплый перелив на каждой странице */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brass-400/50 to-transparent"
        aria-hidden
      />
      <div className="container-prose py-16">
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-6">
          <div className="max-w-md md:col-span-4 lg:col-span-2">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-forest-600 leading-relaxed">
              {siteConfig.description}
            </p>
            <p className="mt-6 text-xs text-forest-600 leading-relaxed">{f.blurb}</p>
          </div>

          {/* Три колонки вместо одного плоского списка на 21 ссылку: столько
              подряд глаз не сканирует, он их пролистывает. Заголовки и разбивка
              берутся из тех же групп, что и меню в шапке, — подвал и навигация
              больше не расходятся, и новых строк словаря не понадобилось. */}
          {footerColumns.map((col) => (
            <div key={col.label}>
              <h2 className="font-sans text-[0.8125rem] font-medium uppercase tracking-eyebrow text-forest-600">
                {col.label}
              </h2>
              <ul className="mt-5 space-y-3">
                {col.items.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <Link
                      href={item.href as Route}
                      className="block py-1.5 text-sm text-forest-500 hover:text-brass-500 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="font-sans text-[0.8125rem] font-medium uppercase tracking-eyebrow text-forest-600">
              {f.contact}
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1.5 text-forest-500 hover:text-brass-500 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={telegramDmLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1.5 text-forest-500 hover:text-brass-500 transition-colors"
                >
                  {f.telegramChat}
                </a>
              </li>
              <li>
                <a
                  href={telegramChannelLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1.5 text-forest-500 hover:text-brass-500 transition-colors"
                >
                  {f.channel} @{siteConfig.contact.telegram.channel}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="block py-1.5 text-forest-500 hover:text-brass-500 transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-forest-500/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-forest-600" suppressHydrationWarning>
            © {currentYear} Right Way Phangan Group. {f.rights}
          </p>
          <div className="flex flex-col gap-2 text-xs text-forest-600 md:flex-row md:items-center md:gap-6">
            <Link
              href={privacyHref}
              className="hover:text-brass-500 transition-colors"
            >
              {privacyLabel}
            </Link>
            <Link
              href={creditsHref}
              className="hover:text-brass-500 transition-colors"
            >
              {creditsLabel}
            </Link>
            <span>{f.location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
