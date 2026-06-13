import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { COMMONS_CREDITS, PEXELS_LICENSE_URL } from "@/content/credits";

export const metadata: Metadata = {
  title: "Photo credits",
  description:
    "Image sources and licensing for photography used on the Right Way Phangan website.",
  alternates: { canonical: "/credits", languages: { en: "/credits", ru: "/ru/credits", "x-default": "/credits" } },
};

export default function CreditsPage() {
  return (
    <>
      <PageHero
        eyebrow="Credits"
        title="Photo credits."
        lede="Some district photography is licensed from photographers via Wikimedia Commons. Per their Creative Commons licenses, we credit each one below. Other imagery is representative atmosphere licensed under the Pexels licence (no attribution required)."
      />

      <section className="container-prose py-12 md:py-16">
        <h2 className="font-serif text-2xl text-forest-900 md:text-3xl">
          Photographs via Wikimedia Commons
        </h2>
        <p className="mt-3 max-w-prose text-sm text-forest-500/70">
          Real photographs of the named place, reused under the licence shown. Titles
          link to the source file; “License” links to the licence text.
        </p>

        <ul className="mt-8 divide-y divide-forest-500/10 border-y border-forest-500/10">
          {COMMONS_CREDITS.map((c) => (
            <li
              key={c.district}
              className="flex flex-col gap-1 py-4 md:flex-row md:items-baseline md:justify-between md:gap-6"
            >
              <div>
                <p className="text-sm font-medium text-forest-900">{c.district}</p>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-forest-500/80 underline-offset-2 hover:text-brass-500 hover:underline"
                >
                  “{c.title}”
                </a>
              </div>
              <p className="text-sm text-forest-500/70">
                {c.author} ·{" "}
                <a
                  href={c.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-brass-500 hover:underline"
                >
                  {c.license}
                </a>
              </p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-serif text-2xl text-forest-900 md:text-3xl">
          Representative imagery via Pexels
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-forest-500/70">
          The remaining district and page photography is representative
          Koh&nbsp;Phangan / Gulf-of-Thailand atmosphere licensed under the{" "}
          <a
            href={PEXELS_LICENSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-brass-500 hover:underline"
          >
            Pexels licence
          </a>{" "}
          (free for commercial use, no attribution required) — atmosphere, not a
          documentary record of a specific plot or beach.
        </p>
      </section>
    </>
  );
}
