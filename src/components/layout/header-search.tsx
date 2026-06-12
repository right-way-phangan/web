"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Route } from "next";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChromeDict } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

/**
 * Header search: a magnifier in the chrome that hands the query to the
 * NL search on /listings (?q=). The AI search is a headline feature, but
 * until now it was only reachable after navigating to /listings — this makes
 * it one tap from any page. `light` mirrors the header's overlay mode.
 */
export function HeaderSearch({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const chrome = getChromeDict(isRu ? "ru" : "en");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setQuery("");
    const base = isRu ? "/ru/listings" : "/listings";
    router.push(`${base}?q=${encodeURIComponent(q)}` as Route);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={chrome.searchAria}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-sm transition-colors",
            light
              ? "text-cream-50 hover:text-brass-300"
              : "text-forest-500 hover:text-brass-500",
          )}
        >
          <Search className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="top-24 translate-y-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{chrome.searchTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={chrome.searchPlaceholder}
            aria-label={chrome.searchAria}
            autoFocus
            enterKeyHint="search"
          />
          <Button type="submit" size="md" className="shrink-0">
            {chrome.searchSubmit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
