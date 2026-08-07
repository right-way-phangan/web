"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  whatsappLink,
  telegramDmLink,
} from "@/lib/site-config";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface server/client errors to console for Vercel log capture.
    console.error("[app:error]", error);
  }, [error]);

  return (
    <section className="container-prose flex min-h-[60vh] flex-col justify-center py-24">
      <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">
        Something went wrong
      </p>
      <h1 className="mt-4 max-w-2xl text-balance">
        We hit an unexpected error.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        We&rsquo;ve logged this. If it&rsquo;s blocking you from something
        important, message us directly — usually faster than waiting for a
        deploy fix.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-forest-500/40">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={() => reset()} variant="primary" size="md">
          Try again
        </Button>
        <Button asChild variant="outline" size="md">
          <a
            href={whatsappLink("I hit an error on the Right Way site.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp us
          </a>
        </Button>
        <Button asChild variant="outline" size="md">
          <a
            href={telegramDmLink("site_error")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram us
          </a>
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </section>
  );
}
