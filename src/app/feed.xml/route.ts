import { getPublicObjects } from "@/lib/data/objects";
import { getSiteUrl } from "@/lib/site-url";
import { siteConfig } from "@/lib/site-config";

/**
 * RSS 2.0 feed of the newest public listings: aggregators, feed readers and
 * non-JS AI crawlers get a machine-readable inventory stream, and it's the
 * ready-made source for auto-posting new listings to the Telegram channel.
 * Prices per listing are public by policy (only the segment range is not).
 */
export const revalidate = 1800;

const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export async function GET() {
  const siteUrl = getSiteUrl();
  const objects = (await getPublicObjects())
    .filter((o) => o.dateAdded)
    .sort((a, b) => (b.dateAdded ?? "").localeCompare(a.dateAdded ?? ""))
    .slice(0, 20);

  const items = objects
    .map((o) => {
      const url = `${siteUrl}/object/${o.rwNumber}`;
      const bits = [
        o.type,
        o.district ? `${o.district}, Koh Phangan` : "Koh Phangan",
        o.areaRai ? `${o.areaRai} rai` : o.areaSqm ? `${o.areaSqm} m²` : null,
        o.bedrooms ? `${o.bedrooms} bedrooms` : null,
        o.priceThb ? `฿${Math.round(o.priceThb).toLocaleString("en-US")}` : null,
      ].filter(Boolean);
      return [
        "    <item>",
        `      <title>${esc(`${o.titleEn} — ${o.rwNumber}`)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(o.dateAdded!).toUTCString()}</pubDate>`,
        `      <description>${esc(bits.join(" · "))}</description>`,
        o.coverImage
          ? `      <enclosure url="${esc(o.coverImage)}" length="0" type="image/jpeg"/>`
          : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteConfig.name)} — new listings</title>
    <link>${siteUrl}/listings</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc("Newest land, villa and house listings on Koh Phangan from " + siteConfig.name + ".")}</description>
    <language>en</language>
    <ttl>30</ttl>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
