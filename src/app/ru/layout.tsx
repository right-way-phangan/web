import type { Metadata } from "next";
import { HtmlLang } from "@/components/layout/html-lang";

/**
 * Locale layer for the RU subtree. Sets og:locale=ru_RU for every /ru/* page
 * (the root layout defaults it to en_US) and corrects the live <html lang> to
 * "ru" via HtmlLang. Only og:locale is overridden here, so the root's file-based
 * OpenGraph image and other shared tags carry through unchanged.
 */
export const metadata: Metadata = {
  openGraph: { locale: "ru_RU" },
};

export default function RuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HtmlLang lang="ru" />
      {children}
    </>
  );
}
