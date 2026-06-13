import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: { absolute: "Политика конфиденциальности — Right Way Phangan" },
  description:
    "Как Right Way Phangan обращается с персональными данными — что собираем, зачем, кто видит, сколько храним и ваши права по PDPA Таиланда.",
  alternates: { canonical: "/ru/privacy", languages: { en: "/privacy", ru: "/ru/privacy", "x-default": "/privacy" } },
};

export default function RussianPrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Конфиденциальность"
        title="Как мы обращаемся с вашими данными."
        lede="Понятная сводка: что мы собираем, зачем, кто это видит и какие у вас права. Составлено с учётом закона Таиланда о защите персональных данных (PDPA)."
      />
      <PrivacyContent locale="ru" />
    </>
  );
}
