"use client";

import Link from "next/link";
import type { Route } from "next";
import { Logo } from "./logo";
import { useAppPathname } from "@/lib/hooks/use-app-pathname";
import {
  siteConfig,
  telegramChannelLink,
  telegramDmLink,
  whatsappLink,
} from "@/lib/site-config";
import { getChromeDict, flatNav } from "@/lib/i18n/dictionaries";

const currentYear = new Date().getFullYear();

export function Footer() {
  const pathname = useAppPathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");
  const f = chrome.footer;
  const exploreLinks = [...flatNav(chrome), { label: f.journal, href: isRu ? "/ru/blog" : "/blog" }];
  const creditsHref = (isRu ? "/ru/credits" : "/credits") as Route;
  const creditsLabel = isRu ? "Кредиты фото" : "Photo credits";
  const privacyHref = (isRu ? "/ru/privacy" : "/privacy") as Route;
  const privacyLabel = isRu ? "Конфиденциальность" : "Privacy";

  // The homepage ends on the full-bleed IslandCta band; let the footer sit flush
  // against it instead of floating below a wide cream gap. Other pages close on
  // light content and keep the breathing room.
  const isHome = pathname === "/" || pathname === "/ru";

  return (
    <footer
      className={`border-t border-forest-500/10 bg-cream-200/40 print:hidden ${
        isHome ? "" : "mt-32"
      }`}
    >
      <div className="container-prose py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2 max-w-md">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-forest-600 leading-relaxed">
              {siteConfig.description}
            </p>
            <p className="mt-6 text-xs text-forest-600 leading-relaxed">{f.blurb}</p>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-forest-600">
              {f.explore}
            </h2>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((item) => (
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

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-forest-600">
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
          <p className="text-xs text-forest-600">
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
