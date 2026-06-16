import Link from "next/link";
import type { Route } from "next";
import { ShieldCheck } from "lucide-react";
import { isVetted } from "@/lib/dd";

/**
 * Due-diligence status line for the object detail header. Data-driven version
 * of the static "Verified listing" link: when the object passed Listing
 * Vetting (ddStatus = Vetted / Full DD, set in /admin/dd) it shows the date of
 * the check; otherwise it falls back to the generic methodology link so we
 * never claim a check we haven't done. Red flag / Pending render the fallback.
 */
export function VettedBadge({
  ddStatus,
  ddDate,
}: {
  ddStatus?: string;
  ddDate?: string;
}) {
  const vetted = isVetted(ddStatus);

  if (!vetted) {
    return (
      <Link
        href={"/due-diligence" as Route}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-forest-500/80 transition-colors hover:text-brass-500"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-brass-500" />
        What we check before listing
      </Link>
    );
  }

  return (
    <Link
      href={"/due-diligence" as Route}
      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-900 transition-colors hover:text-brass-500"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-brass-500 dark:text-jade" />
      Vetted by Right Way{ddDate ? ` · ${ddDate}` : ""}
      <span className="font-medium text-forest-500/70">— what we check</span>
    </Link>
  );
}
