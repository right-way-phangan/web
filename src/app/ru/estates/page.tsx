import type { Metadata } from "next";
import { EstatesIndex } from "@/components/estates/estates-index";

export const metadata: Metadata = {
  title: "Земельные проекты",
  description:
    "Подборки участков на Ко Пангане — несколько участков под застройку от одного собственника под единым титулом, продаются или сдаются по отдельности. Актуальный статус: свободен, резерв, продан или арендован.",
  alternates: {
    canonical: "/ru/estates",
    languages: { en: "/estates", ru: "/ru/estates", "x-default": "/estates" },
  },
};

export const revalidate = 300;

export default function RuEstatesPage() {
  return <EstatesIndex locale="ru" />;
}
