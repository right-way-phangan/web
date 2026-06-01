import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

interface Props {
  filtered: boolean;
  clearHref: Route;
}

export function ListingsEmpty({ filtered, clearHref }: Props) {
  if (filtered) {
    return (
      <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-200/40 p-12 text-center">
        <h2 className="font-serif text-2xl text-forest-500">
          No matches for these filters.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-forest-500/70">
          Try removing one of the criteria, or send us a brief — we often have
          listings that aren't published yet.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" size="md">
            <Link href={clearHref}>Clear filters</Link>
          </Button>
          <Button asChild variant="primary" size="md">
            <Link href="/contact">Send a brief</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-sm border border-forest-500/10 bg-cream-200/40 p-12 text-center">
      <h2 className="font-serif text-2xl text-forest-500">
        Nothing to show right now.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-forest-500/70">
        Our catalog refreshes every few minutes. If you're looking for
        something specific, message us and we'll send matches privately.
      </p>
      <div className="mt-8">
        <Button asChild variant="primary" size="md">
          <Link href="/contact">Send a brief</Link>
        </Button>
      </div>
    </div>
  );
}
