import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-prose flex min-h-[60vh] flex-col justify-center py-24">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        404
      </p>
      <h1 className="mt-4 max-w-2xl text-balance">
        This page can&rsquo;t be found.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        Either the link is broken, the property is no longer active, or
        someone mistyped the URL. The pages below cover most of what people
        come here for.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/listings">Browse listings</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/districts">Districts</Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/faq">FAQ</Link>
        </Button>
        <Button asChild variant="ghost" size="md">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </section>
  );
}
