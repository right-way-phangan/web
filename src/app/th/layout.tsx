import type { Metadata } from "next";
import { HtmlLang } from "@/components/layout/html-lang";

/**
 * Locale layer for the TH subtree. Sets og:locale=th_TH for every /th/* page
 * (the root layout defaults it to en_US) and corrects the live <html lang> to
 * "th" via HtmlLang. Only og:locale is overridden here, so the root's file-based
 * OpenGraph image and other shared tags carry through unchanged.
 */
export const metadata: Metadata = {
  openGraph: { locale: "th_TH" },
};

export default function ThaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HtmlLang lang="th" />
      {children}
    </>
  );
}
