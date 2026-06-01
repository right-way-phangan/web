import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/page-placeholder";

export const metadata: Metadata = { title: "Process" };

export default function ProcessPage() {
  return (
    <PagePlaceholder
      eyebrow="Process"
      title="From first call to keys in hand."
      text="Our five-step process for international buyers: brief, shortlist, on-island viewings, due diligence, closing. Clear timelines, clear fees, no surprises."
      expectedDay="Day 8"
    />
  );
}
