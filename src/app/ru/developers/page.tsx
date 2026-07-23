import type { Metadata } from "next";
import { DevelopersIndex } from "@/components/projects/developers-index";

export const metadata: Metadata = {
  title: "Застройщики Ко Пангана",
  description:
    "Проверенные застройщики, строящие на Ко Пангане — история, текущие проекты и прямая заявка.",
  alternates: {
    canonical: "/ru/developers",
    languages: {
      en: "/developers",
      ru: "/ru/developers",
      "x-default": "/developers",
    },
  },
};

export const revalidate = 300;

export default function RuDevelopersPage() {
  return <DevelopersIndex locale="ru" />;
}
