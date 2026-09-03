"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Heart, ChevronDown } from "lucide-react";
import { useAppPathname } from "@/lib/hooks/use-app-pathname";
import { Logo } from "./logo";
import { HeaderSearch } from "./header-search";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/lib/saved/saved-context";
import { getChromeDict } from "@/lib/i18n/dictionaries";
import type { NavGroup } from "@/lib/i18n/dictionaries";
import {
  siteConfig,
  telegramDmLink,
  whatsappLink,
} from "@/lib/site-config";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const { saved, ready } = useSaved();
  const savedCount = ready ? saved.length : 0;
  const pathname = useAppPathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");
  const contactHref = (isRu ? "/ru/contact" : "/contact") as Route;
  const savedHref = isRu ? "/ru/saved" : "/saved";

  // On the homepage the header floats transparent over the hero photo and
  // only gains its cream background after the visitor scrolls.
  const isHome = pathname === "/" || pathname === "/ru";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);
  const overlay = isHome && !scrolled;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // The overlay must portal to <body>: the header's backdrop-blur creates a
  // containing block that would otherwise trap our position:fixed overlay.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock background scroll and close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close on navigation so the panel never lingers across pages.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "top-0 z-40 w-full border-b transition-colors duration-300 print:hidden",
        isHome ? "fixed" : "sticky",
        overlay
          ? "border-transparent bg-transparent"
          : "border-forest-500/10 bg-cream-100/80 backdrop-blur-md dark:border-bronze/25 dark:bg-cream-100/60 dark:backdrop-blur-xl dark:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.7)]",
      )}
    >
      <div className="container-prose flex h-16 items-center justify-between gap-6 md:h-20">
        <Logo tone={overlay ? "light" : "default"} className="shrink-0" />

        <nav className="hidden lg:flex items-center gap-x-6" aria-label="Primary">
          {chrome.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "nav-underline relative whitespace-nowrap text-sm transition-colors",
                overlay ? "hover:text-brass-300" : "hover:text-brass-500",
                isActive(item.href)
                  ? overlay
                    ? "text-brass-300"
                    : "text-brass-500"
                  : overlay
                    ? "text-panel-fg"
                    : "text-forest-500",
              )}
            >
              {item.label}
            </Link>
          ))}
          {chrome.groups.map((group) => (
            <NavDropdown
              key={group.label}
              group={group}
              isActive={isActive}
              light={overlay}
            />
          ))}
        </nav>

        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <HeaderSearch light={overlay} />
          <ThemeToggle light={overlay} />
          <LanguageSwitcher tone={overlay ? "light" : "default"} />
          <SavedLink
            count={savedCount}
            label={chrome.savedAria}
            href={savedHref}
            light={overlay}
          />
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              overlay &&
                "border-panel-fg/40 text-panel-fg hover:border-panel-fg hover:bg-panel-fg hover:text-panel",
            )}
          >
            <Link href={contactHref}>{chrome.getInTouch}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <HeaderSearch light={overlay} />
          {/* Logo 169px + four 44px buttons = 405px: on 375/390 phones the
              burger sat off-screen. Below 420px the theme toggle moves into
              the menu panel instead. */}
          <div className="hidden min-[420px]:block">
            <ThemeToggle light={overlay} />
          </div>
          <SavedLink
            count={savedCount}
            label={chrome.savedAria}
            href={savedHref}
            light={overlay}
          />
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-sm transition-colors",
              overlay ? "text-panel-fg" : "text-forest-500",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Full-screen mobile overlay — portaled to <body> so the header's
          backdrop-blur containing block can't trap our fixed positioning. */}
      {mounted
        ? createPortal(
            <div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className={cn(
                "fixed inset-0 z-50 flex flex-col bg-cream-100 lg:hidden",
                "transition-[opacity,transform] duration-300 ease-out",
                open
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "pointer-events-none -translate-y-2 opacity-0",
              )}
            >
        <div className="flex h-16 w-full items-center justify-between border-b border-forest-500/10 px-6 md:h-20 md:px-8">
          <Logo />
          <div className="flex items-center gap-1">
            <div className="min-[420px]:hidden">
              <ThemeToggle />
            </div>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-sm text-forest-500 transition-colors hover:text-brass-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav
          className="w-full flex-1 overflow-y-auto px-6 md:px-8"
          aria-label="Mobile"
        >
          <ul className="flex flex-col py-6">
            {chrome.nav.map((item, i) => {
              const active = isActive(item.href);
              return (
                <li
                  key={item.href}
                  className="border-b border-forest-500/10"
                >
                  <Link
                    href={item.href as Route}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-baseline justify-between gap-4 py-3 transition-colors",
                      active
                        ? "text-brass-500"
                        : "text-forest-500 hover:text-brass-500",
                    )}
                  >
                    <span className="font-serif text-[1.4rem] leading-none tracking-tight transition-transform duration-200 group-hover:translate-x-1">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-[0.7rem] font-medium tabular-nums tracking-eyebrow transition-colors",
                        active
                          ? "text-brass-500"
                          : "text-forest-500/30 group-hover:text-brass-500/70",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {chrome.groups.map((group) => (
            <div key={group.label} className="pb-6">
              <p className="pt-2 text-[0.8125rem] font-medium uppercase tracking-eyebrow text-forest-500/40">
                {group.label}
              </p>
              <ul className="mt-2 flex flex-col">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href as Route}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block py-2.5 font-serif text-lg leading-none tracking-tight transition-colors",
                          active
                            ? "text-brass-500"
                            : "text-forest-500 hover:text-brass-500",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="w-full space-y-5 border-t border-forest-500/10 px-6 py-6 md:px-8">
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <SavedLink count={savedCount} label={chrome.savedAria} href={savedHref} />
          </div>
          <Button asChild className="w-full">
            <Link href={contactHref} onClick={() => setOpen(false)}>
              {chrome.getInTouch}
            </Link>
          </Button>
          <div className="flex items-center gap-5 text-sm text-forest-500/70">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brass-500"
            >
              WhatsApp
            </a>
            <a
              href={telegramDmLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brass-500"
            >
              Telegram
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="ml-auto truncate transition-colors hover:text-brass-500"
            >
              {siteConfig.contact.email}
            </a>
          </div>
        </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

/**
 * Desktop nav dropdown. Pure CSS hover/focus — no client state — so it stays
 * cheap and keyboard-reachable: focusing the trigger or tabbing into a link
 * opens the panel via group-focus-within. A pt-3 bridge keeps the hover target
 * connected to the trigger so the panel doesn't drop on the way down.
 */
function NavDropdown({
  group,
  isActive,
  light = false,
}: {
  group: NavGroup;
  isActive: (href: string) => boolean;
  light?: boolean;
}) {
  const groupActive = group.items.some((item) => isActive(item.href));
  // Mirror the CSS hover/focus visibility into state so aria-expanded is truthful
  // for assistive tech (the panel itself stays driven by group-hover/focus-within).
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "flex items-center gap-1 whitespace-nowrap text-sm transition-colors",
          light ? "hover:text-brass-300" : "hover:text-brass-500",
          groupActive
            ? light
              ? "text-brass-300"
              : "text-brass-500"
            : light
              ? "text-panel-fg"
              : "text-forest-500",
        )}
      >
        {group.label}
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0",
          // Панель вырастает из-под своей кнопки, а не проявляется на месте:
          // масштаб от верхней кромки связывает её с триггером (по центру
          // появляются модалки — они ни к чему не привязаны).
          "origin-top scale-[0.97] transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "group-hover:visible group-hover:scale-100 group-hover:opacity-100",
          "group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100",
        )}
      >
        <ul id={panelId} className="min-w-44 rounded-md border border-forest-500/10 bg-cream-50 p-2 shadow-lg shadow-panel/10">
          {group.items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href as Route}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap rounded-sm px-3 py-2 text-sm transition-colors hover:bg-forest-50 hover:text-brass-500",
                    active ? "text-brass-500" : "text-forest-500",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SavedLink({
  count,
  label = "Saved listings",
  href = "/saved",
  light = false,
}: {
  count: number;
  label?: string;
  href?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href as Route}
      aria-label={`${label}${count ? ` (${count})` : ""}`}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-sm transition-colors",
        light ? "text-panel-fg hover:text-brass-300" : "text-forest-500 hover:text-brass-500",
      )}
    >
      <Heart className={cn("h-5 w-5", count > 0 && "fill-brass-500 text-brass-500")} />
      {count > 0 ? (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass-500 px-1 text-[10px] font-semibold leading-none text-panel-fg">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
