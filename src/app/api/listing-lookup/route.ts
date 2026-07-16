import lookup from "@/content/listing-lookup.json";

/**
 * Airbnb-listing → nightly rate, from our own island scrape (~1k listings). The
 * "my own property" entry on /calculator posts a room id here; a hit prefills an
 * exact rate, a miss falls back to district data. Server-side so the 65 KB table
 * never ships to every calculator visitor. Data refreshes with the rental-market
 * pipeline (export_web.py → listing-lookup.json).
 */
type Entry = { adr: number; district?: string; bedrooms?: number };
const TABLE = lookup as { asOf: string; listings: Record<string, Entry> };

export function GET(req: Request): Response {
  const room = new URL(req.url).searchParams.get("room")?.trim();
  if (!room || !/^\d+$/.test(room)) {
    return Response.json({ found: false }, { status: 400 });
  }
  const hit = TABLE.listings[room];
  if (!hit) return Response.json({ found: false }, { status: 404 });
  return Response.json({ found: true, asOf: TABLE.asOf, ...hit });
}
