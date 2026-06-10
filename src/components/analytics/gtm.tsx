import Script from "next/script";

/**
 * Google Tag Manager container — single dispatcher for GA4 / Meta Pixel / Google
 * Ads. Inert until NEXT_PUBLIC_GTM_ID is set, so it ships dark and lights up the
 * moment the env var lands in Vercel (no redeploy of logic needed).
 *
 * Render <GtmScript/> anywhere in <body> (afterInteractive injects into <head>)
 * and <GtmNoScript/> as the first child of <body>. Do NOT add to app/ru/layout —
 * Russia is out of the marketing perimeter for now.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function GtmScript() {
  if (!GTM_ID) return null;
  return (
    <Script
      id="gtm-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

export function GtmNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="gtm"
      />
    </noscript>
  );
}
