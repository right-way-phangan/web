import type { Metadata } from "next";
import { EstatesIndex } from "@/components/estates/estates-index";

export const metadata: Metadata = {
  title: "Land estates",
  description:
    "Plot collections on Koh Phangan — several building plots from a single owner under one title, sold or leased individually. Live availability: available, reserved, sold or leased.",
  alternates: {
    canonical: "/estates",
    languages: { en: "/estates", ru: "/ru/estates", "x-default": "/estates" },
  },
};

export const revalidate = 300;

export default function EstatesPage() {
  return <EstatesIndex locale="en" />;
}
