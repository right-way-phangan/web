import type { Metadata } from "next";
import { getPublicObjects } from "@/lib/data/objects";
import { SavedListings } from "@/components/objects/saved-listings";
import { SavedSearches } from "@/components/objects/saved-searches";

export const metadata: Metadata = {
  title: "Избранное",
  description:
    "Ваш шорт-лист объектов на Ко Пангане — сравните их бок о бок и отправьте весь список в Right Way одним нажатием.",
  alternates: { canonical: "/ru/saved", languages: { en: "/saved", ru: "/ru/saved" } },
  robots: { index: false, follow: true },
};

export const revalidate = 300;

export default async function RussianSavedPage() {
  // The saved set lives in the browser; we hand the full catalog to the client
  // component, which filters it to the visitor's shortlist.
  const catalog = await getPublicObjects();

  return (
    <section className="container-prose py-16 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">Шорт-лист</p>
      <h1 className="mt-4 max-w-3xl text-balance">Ваши сохранённые объекты.</h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        Всё, что вы отметили, в одном месте. Сравните детали, отправьте нам список — дальше мы возьмём
        на себя.
      </p>

      <SavedListings catalog={catalog} />
      <SavedSearches />
    </section>
  );
}
