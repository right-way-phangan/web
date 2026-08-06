"use client";

import { usePathname } from "next/navigation";

/**
 * `usePathname()` normalised for the two home routes.
 *
 * During static prerender Next reports the home page as "/index" (and the RU
 * home as "/ru/index") — the name of the generated HTML file, not the URL the
 * browser will be on. Components that branch on the path then render one way on
 * the server and another after hydration: the language switcher emitted
 * href="/ru/index" (a 404), and the header/footer picked the non-home layout.
 */
export function useAppPathname(): string {
  const pathname = usePathname();
  if (pathname === "/index") return "/";
  if (pathname === "/ru/index") return "/ru";
  return pathname;
}

/**
 * Админка живёт под тем же корневым layout, что и сайт, поэтому под CRM
 * подкладывался публичный подвал на 21 ссылку («Смотреть объекты», «Журнал»,
 * маркетинговое описание агентства) и висел плавающий WhatsApp для клиентов.
 * Хедер при этом оставляем: в нём переключатель темы и выход на сайт, которых
 * в AdminNav нет.
 */
export function useIsAdminRoute(): boolean {
  const pathname = useAppPathname();
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
