"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * GA4 directly via gtag.js — the interim wiring while the GTM container waits
 * on Meta Pixel / NEXT_PUBLIC_GTM_ID (см. playbook Приложение A). The moment
 * NEXT_PUBLIC_GTM_ID lands in Vercel this component renders nothing, GTM takes
 * over GA4, and window.gtag disappears — so events are never double-counted.
 *
 * The measurement id is public by nature (it ships in every page's HTML on any
 * GA4 site), hence the committed default; NEXT_PUBLIC_GA4_ID overrides it.
 *
 * App Router is an SPA: gtag's automatic page_view only fires on the full
 * load, so we disable it and send page_view manually on every route change.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-DQQ2603VD9";

export function Ga4Script() {
  if (GTM_ID || !GA4_ID) return null;
  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}',{send_page_view:false});`,
        }}
      />
      <Ga4RouteTracker />
    </>
  );
}

/** Sends page_view on mount and on every pathname change. */
function Ga4RouteTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    // Defer one tick so document.title reflects the new route's metadata.
    const t = setTimeout(() => {
      window.gtag?.("event", "page_view", {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title,
      });
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
