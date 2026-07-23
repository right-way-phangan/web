import type { Metadata } from "next";
import { DevelopersIndex } from "@/components/projects/developers-index";

export const metadata: Metadata = {
  title: "Developers on Koh Phangan",
  description:
    "Vetted developers building on Koh Phangan — track record, current projects and a direct line to enquire.",
  alternates: {
    canonical: "/developers",
    languages: {
      en: "/developers",
      ru: "/ru/developers",
      "x-default": "/developers",
    },
  },
};

export const revalidate = 300;

export default function DevelopersPage() {
  return <DevelopersIndex locale="en" />;
}
