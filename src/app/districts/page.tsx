import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/page-placeholder";

export const metadata: Metadata = { title: "Districts" };

export default function DistrictsPage() {
  return (
    <PagePlaceholder
      eyebrow="Districts"
      title="Six districts, each with a different vibe."
      text="Srithanu, Thong Sala, Haad Salad, Chaloklum, Thong Nai Pan, Bottle Beach — and a handful of smaller spots. Where to buy depends on how you want to live."
      expectedDay="Day 9"
    />
  );
}
