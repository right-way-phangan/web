import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/page-placeholder";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <PagePlaceholder
      eyebrow="FAQ"
      title="Buying property on Phangan, demystified."
      text="Thirty answers to the questions foreign buyers actually ask: Chanote vs NS3, freehold vs leasehold, company structures, taxes, utilities, what to check on a viewing."
      expectedDay="Day 10"
    />
  );
}
