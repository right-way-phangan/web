"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { Logo } from "./logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { useSaved } from "@/lib/saved/saved-context";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const { saved, ready } = useSaved();
  const savedCount = ready ? saved.length : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-forest-500/10 bg-cream-100/80 backdrop-blur-md">
      <div className="container-prose flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="text-sm text-forest-500 hover:text-brass-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-3">
          <LanguageSwitcher />
          <SavedLink count={savedCount} />
          <Button asChild variant="outline" size="sm">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <SavedLink count={savedCount} />
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-sm text-forest-500"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-forest-500/10 bg-cream-100 transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav
          className="container-prose flex flex-col gap-1 py-4"
          aria-label="Mobile"
        >
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              onClick={() => setOpen(false)}
              className="py-3 text-base text-forest-500 border-b border-forest-500/5 last:border-b-0 hover:text-brass-500"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}

function SavedLink({ count }: { count: number }) {
  return (
    <Link
      href="/saved"
      aria-label={`Saved listings${count ? ` (${count})` : ""}`}
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
