import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CRM_ENABLED } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";
import { NewLeadForm } from "@/components/crm/new-lead-form";

export const metadata: Metadata = {
  title: "CRM — новый лид",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function NewLeadPage() {
  if (!CRM_ENABLED) notFound();
  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <Link
        href={{ pathname: "/admin/crm" }}
        className="text-xs text-forest-900/50 hover:text-forest-900"
      >
        ← Доска лидов
      </Link>
      <div className="mb-6 mt-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brass-500">
          Admin · CRM
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Новый лид</h1>
        <p className="mt-1 max-w-xl text-sm text-forest-900/60">
          Завести клиента, пришедшего вне сайта: зашёл в офис (walk-in), позвонил с рекламы,
          написал в Telegram/WhatsApp или по рекомендации. Минимум — имя; источник и квалификация
          помогают вести и считать конверсию по каналам.
        </p>
      </div>
      <NewLeadForm />
    </section>
  );
}
