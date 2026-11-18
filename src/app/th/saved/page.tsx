import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicObjects, slimObjectForCard } from "@/lib/data/objects";
import { SavedListings } from "@/components/objects/saved-listings";
import { SavedSearches } from "@/components/objects/saved-searches";

export const metadata: Metadata = {
  title: "รายการที่บันทึกไว้",
  description:
    "รายการทรัพย์บนเกาะพะงันที่คุณคัดไว้ — เปรียบเทียบแบบเคียงข้างกัน แล้วส่งทั้งรายการถึง Right Way ได้ในครั้งเดียว",
  alternates: { canonical: "/th/saved", languages: { en: "/saved", ru: "/ru/saved", th: "/th/saved", "x-default": "/saved" } },
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

export default async function ThaiSavedPage() {
  // The saved set lives in the browser; we hand the full catalog to the client
  // component, which filters it to the visitor's shortlist.
  const catalog = (await getPublicObjects()).map(slimObjectForCard);

  return (
    <section className="container-prose py-14 md:py-20">
      <p className="text-[0.8125rem] font-medium uppercase tracking-eyebrow text-brass-500">รายการคัดสรร</p>
      <h1 className="mt-4 max-w-3xl text-balance">ทรัพย์ที่คุณบันทึกไว้</h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        ทุกอย่างที่คุณกดถูกใจไว้ รวมอยู่ในที่เดียว เปรียบเทียบรายละเอียด แล้วส่งรายการมาให้เรา
        จากนั้นเราจะดูแลต่อเอง
      </p>

      {/* Suspense: SavedListings reads ?rw= (shared shortlists) via useSearchParams */}
      <Suspense
        fallback={
          <div className="mt-12 h-40 animate-pulse rounded-sm border border-forest-500/10 bg-forest-500/5" />
        }
      >
        <SavedListings catalog={catalog} />
      </Suspense>
      <SavedSearches />
    </section>
  );
}
