import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/page-placeholder";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PagePlaceholder
      eyebrow="About"
      title="A boutique agency, built on the island."
      text="We focus on land, villas, and houses on Koh Phangan — for international buyers who want a transparent process and someone who actually knows each district."
      expectedDay="Day 8"
    />
  );
}
