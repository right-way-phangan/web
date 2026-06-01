import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getObjectByRwNumber } from "@/lib/data/objects";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ rw: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) return { title: `${rw} not found` };
  return {
    title: `${object.titleEn} — ${object.rwNumber}`,
    description: object.descriptionRaw?.slice(0, 160),
  };
}

export default async function ObjectPage({ params }: Props) {
  const { rw } = await params;
  const object = await getObjectByRwNumber(rw);
  if (!object) notFound();

  return (
    <section className="container-prose py-16 md:py-24">
      <Button asChild variant="ghost" size="sm" className="mb-8">
        <Link href="/listings">
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </Button>

      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        {object.rwNumber} · {object.type}
        {object.district ? ` · ${object.district}` : ""}
      </p>

      <h1 className="mt-4 max-w-3xl text-balance">{object.titleEn}</h1>

      <p className="mt-6 max-w-xl text-base text-forest-500/70">
        Full detail page lands Day 4 — gallery, spec table, investment
        highlights, inquiry form. For now, contact us directly to ask about{" "}
        {object.rwNumber}.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild variant="primary" size="md">
          <Link href="/contact">Ask about this property</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/listings">See other listings</Link>
        </Button>
      </div>
    </section>
  );
}
