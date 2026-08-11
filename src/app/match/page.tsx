import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { MatchChat } from "@/components/match/match-chat";

export const metadata: Metadata = {
  alternates: {
    canonical: "/match",
    languages: { en: "/match", ru: "/ru/match", "x-default": "/match" },
  },
  title: "AI property match",
  description:
    "Tell our AI what you're looking for on Koh Phangan — in a short conversation — and get a ranked shortlist with a fit score for each place.",
};

export const revalidate = 300;
// Финальный ход зовёт две модели (интервью + ранжирование) — даём запас времени.
export const maxDuration = 30;

export default function MatchPage() {
  return (
    <section className="pb-16">
      <PageHero
        eyebrow="AI property match"
        title="Tell us what you're really after."
        lede="A short conversation with our AI, then a ranked shortlist with a fit score for every place. Free, no sign-up."
      />
      <div className="mt-12 md:mt-16">
        <MatchChat locale="en" />
      </div>
    </section>
  );
}
