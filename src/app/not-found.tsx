"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const COPY = {
  en: {
    title: "This page can’t be found.",
    lede: "Either the link is broken, the property is no longer active, or someone mistyped the URL. The pages below cover most of what people come here for.",
    listings: "Browse listings",
    districts: "Districts",
    faq: "FAQ",
    home: "Home",
  },
  ru: {
    title: "Страница не найдена.",
    lede: "Возможно, ссылка устарела, объект больше не активен или в адресе опечатка. Ниже — разделы, за которыми сюда чаще всего приходят.",
    listings: "Смотреть объекты",
    districts: "Районы",
    faq: "FAQ",
    home: "На главную",
  },
};

export default function NotFound() {
  const pathname = usePathname();
  const isRu = pathname === "/ru" || pathname.startsWith("/ru/");
  const t = isRu ? COPY.ru : COPY.en;
  const home = (isRu ? "/ru" : "/") as Route;

  return (
    <section className="container-prose flex min-h-[60vh] flex-col justify-center py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">404</p>
      <h1 className="mt-4 max-w-2xl text-balance">{t.title}</h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">{t.lede}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/listings">{t.listings}</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/districts">{t.districts}</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/faq">{t.faq}</Link>
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link href={home}>{t.home}</Link>
        </Button>
      </div>
    </section>
  );
}
