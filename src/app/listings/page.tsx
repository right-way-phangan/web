import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/page-placeholder";

export const metadata: Metadata = { title: "Listings" };

export default function ListingsPage() {
  return (
    <PagePlaceholder
      eyebrow="Listings"
      title="Every active property on Phangan."
      text="A curated catalog of land, villas, and houses — pulled directly from our CRM, filterable by district, type, and budget."
      expectedDay="Day 3"
    />
  );
}
