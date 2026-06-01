import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  eyebrow: string;
  title: string;
  text: string;
  expectedDay?: string;
}

export function PagePlaceholder({ eyebrow, title, text, expectedDay }: Props) {
  return (
    <section className="container-prose flex min-h-[70vh] flex-col justify-center py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        {eyebrow}
      </p>
      <h1 className="mt-6 max-w-3xl text-balance">{title}</h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">{text}</p>
      {expectedDay ? (
        <p className="mt-3 text-sm text-forest-500/40">
          Expected: {expectedDay} of MVP build.
        </p>
      ) : null}
      <div className="mt-10">
        <Button asChild variant="outline" size="md">
          <Link href="/">← Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
