"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { Logo } from "./logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/lib/saved/saved-context";
import { getChromeDict } from "@/lib/i18n/dictionaries";
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
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");
  const contactHref = (isRu ? "/ru/contact" : "/contact") as Route;
  const savedHref = isRu ? "/ru/saved" : "/saved";

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
    <header className="sticky top-0 z-40 w-full border-b border-forest-500/10 bg-cream-100/80 backdrop-blur-md">
      <div className="container-prose flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav className="hidden xl:flex items-center gap-x-5" aria-label="Primary">
          {chrome.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="whitespace-nowrap text-sm text-forest-500 hover:text-brass-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex xl:items-center xl:gap-3">
          <LanguageSwitcher />
          <SavedLink count={savedCount} label={chrome.savedAria} href={savedHref} />
          <Button asChild variant="outline" size="sm">
            <Link href={contactHref}>{chrome.getInTouch}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 xl:hidden">
          <SavedLink count={savedCount} label={chrome.savedAria} href={savedHref} />
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-sm text-forest-500"
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
                "fixed inset-0 z-50 flex flex-col bg-cream-100 xl:hidden",
                "transition-[opacity,transform] duration-300 ease-out",
                open
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "pointer-events-none -translate-y-2 opacity-0",
              )}
            >
        <div className="flex h-16 w-full items-center justify-between border-b border-forest-500/10 px-6 md:h-20 md:px-8">
          <Logo />
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-forest-500 transition-colors hover:text-brass-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav
          className="w-full flex-1 overflow-y-auto px-6 md:px-8"
          aria-label="Mobile"
        >
          <ul className="flex min-h-full flex-col justify-center py-6">
            {chrome.nav.map((item, i) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li
                  key={item.href}
                  className="border-b border-forest-500/10 last:border-b-0"
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
                        "text-[0.7rem] font-medium tabular-nums tracking-[0.25em] transition-colors",
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

function SavedLink({
  count,
  label = "Saved listings",
  href = "/saved",
}: {
  count: number;
  label?: string;
  href?: string;
}) {
  return (
    <Link
      href={href as Route}
      aria-label={`${label}${count ? ` (${count})` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-sm text-forest-500 transition-colors hover:text-brass-500"
    >
      <Heart className={cn("h-5 w-5", count > 0 && "fill-brass-500 text-brass-500")} />
      {count > 0 ? (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass-500 px-1 text-[10px] font-semibold leading-none text-cream-50">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
