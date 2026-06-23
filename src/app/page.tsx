import type { Metadata } from "next";
import { LocalizedHome } from "@/components/sections/localized-home";
import { getHomeDict } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", ru: "/ru", "x-default": "/" },
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const revalidate = 300;

export default function HomePage() {
  return <LocalizedHome dict={getHomeDict("en")} locale="en" />;
}
