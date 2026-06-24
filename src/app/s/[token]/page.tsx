import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyShortlistToken } from "@/lib/shortlist-token";
import { getLead } from "@/lib/data/leads";
import { getPublicObjects } from "@/lib/data/objects";
import { ShortlistBeacon } from "@/components/shortlist-beacon";

export const metadata: Metadata = {
  title: "Подборка объектов — Right Way Phangan",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-US");

/**
 * Client-facing shortlist page: the agent taps «Поделиться подборкой» on the
 * lead card and sends this link in WhatsApp. Signed token → no login, no
 * enumeration; only public (photographed, active) objects are shown. Clicks
 * through to object pages feed the first-party view counter.
 */
export default async function ShortlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const leadId = verifyShortlistToken(token);
  if (!leadId) notFound();

  const lead = await getLead(leadId);
  if (!lead) notFound();

  const rws = new Set(
    (lead.tags ?? []).filter((t) => t.startsWith("object:")).map((t) => t.slice(7)),
  );
  const objects = (await getPublicObjects()).filter((o) => rws.has(o.rwNumber));

  return (
    <main className="min-h-screen bg-cream-50">
      <ShortlistBeacon token={token} />
      <header className="border-b border-forest-900/10 bg-cream-50 px-4 py-5 text-center">
        <p className="font-serif text-xl font-semibold tracking-wide text-forest-900">
          Right Way Phangan
        </p>
        <h1 className="mt-1 text-sm text-forest-900/60">
          {lead.contactName
            ? `Personal selection for ${lead.contactName}`
            : "Your personal property selection"}
        </h1>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        {objects.length === 0 ? (
          <p className="py-16 text-center text-sm text-forest-900/55">
            The selection is being prepared — check back shortly.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {objects.map((o) => (
              <Link
                key={o.rwNumber}
                href={`/object/${o.rwNumber}` as `/object/${string}`}
                className="group overflow-hidden rounded-2xl border border-forest-900/10 bg-cream-50 transition hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-forest-900/5">
                  {o.coverImage && (
                    <Image
                      src={o.coverImage}
                      alt={o.titleEn || o.rwNumber}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-brass-600">
                    {o.rwNumber}
                    {o.district ? ` · ${o.district}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 font-medium text-forest-900">
                    {o.titleEn || `${o.type} on Koh Phangan`}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-forest-900">
                    {o.priceThb ? `฿${nf.format(o.priceThb)}` : "Price on request"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-forest-900/45">
          Right Way Phangan Group ·{" "}
          <a href="https://rightwaygroup.co" className="underline hover:text-forest-900">
            rightwaygroup.co
          </a>
        </p>
      </section>
    </main>
  );
}
