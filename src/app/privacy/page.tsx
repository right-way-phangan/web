import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { PrivacyContent } from "@/components/legal/privacy-content";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Right Way Phangan handles personal data — what we collect, why, who sees it, how long we keep it, and your rights under Thailand's PDPA.",
  alternates: { canonical: "/privacy", languages: { en: "/privacy", ru: "/ru/privacy", "x-default": "/privacy" } },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="How we handle your data."
        lede="Plain-language summary of what we collect, why, who sees it, and the rights you have. Written for Thailand's Personal Data Protection Act."
      />
      <PrivacyContent locale="en" />
    </>
  );
}
