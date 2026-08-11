import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { MatchChat } from "@/components/match/match-chat";

export const metadata: Metadata = {
  title: "ИИ-подбор недвижимости",
  description:
    "Расскажите ИИ в коротком разговоре, что ищете на Ко Пангане — и получите ранжированную подборку с оценкой соответствия по каждому объекту.",
  alternates: {
    canonical: "/ru/match",
    languages: { en: "/match", ru: "/ru/match", "x-default": "/match" },
  },
};

export const revalidate = 300;
export const maxDuration = 30;

export default function RussianMatchPage() {
  return (
    <section className="pb-16">
      <PageHero
        eyebrow="ИИ-подбор недвижимости"
        title="Расскажите, что вы ищете на самом деле."
        lede="Короткий разговор с нашим ИИ — и ранжированная подборка с оценкой соответствия по каждому объекту. Бесплатно, без регистрации."
      />
      <div className="mt-12 md:mt-16">
        <MatchChat locale="ru" />
      </div>
    </section>
  );
}
