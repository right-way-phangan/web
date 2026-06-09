import type { Metadata } from "next";
import { LocalizedHome } from "@/components/sections/localized-home";
import { getHomeDict } from "@/lib/i18n/dictionaries";

export const revalidate = 300;

export const metadata: Metadata = {
  // absolute: заголовок уже содержит бренд — иначе шаблон "%s · Right Way Phangan"
  // добавил бы бренд второй раз ("…Ко Пангане · Right Way Phangan").
  title: { absolute: "Right Way Phangan — недвижимость на Ко Пангане" },
  description:
    "Бутиковое агентство недвижимости на Ко Пангане для иностранных покупателей: земля, виллы и дома. Проверенные объекты, прозрачный процесс, поиск с помощью ИИ.",
  alternates: {
    canonical: "/ru",
    languages: { en: "/", ru: "/ru" },
  },
};

export default function RussianHomePage() {
  return <LocalizedHome dict={getHomeDict("ru")} locale="ru" />;
}
