"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  href: string;
  label: string;
}

/**
 * Back button that prefers history.back() so an in-tab return to /listings
 * keeps the visitor's NL-search / filters (they live in the query string).
 * Falls back to a plain link when the page opened in a fresh tab.
 */
export function BackLink({ href, label }: Props) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    if (
      window.history.length > 1 &&
      document.referrer.startsWith(window.location.origin)
    ) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Button asChild variant="ghost" size="sm" className="mb-6">
      <Link href={href as Route} onClick={onClick}>
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
