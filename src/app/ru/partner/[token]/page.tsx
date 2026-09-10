import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifyPartnerToken } from "@/lib/partner/token";
import { getPartnerReport } from "@/lib/partner/stats";
import { PartnerReportView } from "@/components/partner/partner-report";

export const metadata: Metadata = {
  title: "Отчёт партнёра — Right Way",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PartnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const slug = await verifyPartnerToken(token);
  if (!slug) notFound();
  const report = await getPartnerReport(slug);
  if (!report) notFound();
  return <PartnerReportView report={report} locale="ru" />;
}
