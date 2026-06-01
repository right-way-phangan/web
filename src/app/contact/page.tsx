import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/sections/page-placeholder";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PagePlaceholder
      eyebrow="Contact"
      title="Tell us what you're looking for."
      text="Brief us by message or schedule a call. We reply within the working day. If you already have a property in mind, mention the listing code."
      expectedDay="Day 7"
    />
  );
}
