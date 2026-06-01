import { MapPin, ShieldCheck, Sparkles } from "lucide-react";

const VALUES = [
  {
    icon: MapPin,
    title: "Phangan specialists",
    text: "Every listing is on Koh Phangan. We know each district personally — Srithanu, Thong Sala, Haad Salad, Bottle Beach, and the rest.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent process",
    text: "Verified ownership, real prices, clear closing steps. Foreign-buyer friendly: Chanote checks, lease structuring, lawyer introductions.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted search",
    text: "Tell us what you want — sunset view, walking distance to beach, 2-rai plot — and we narrow the island down to the ten worth seeing.",
  },
] as const;

export function Values() {
  return (
    <section className="container-prose py-24 md:py-32">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-brass-500">
        Why Right Way
      </p>
      <h2 className="mt-4 max-w-3xl text-balance">
        Boutique, not brokerage.
      </h2>
      <p className="mt-6 max-w-xl text-lg text-forest-500/70">
        Three things we do differently from the rest of the island.
      </p>

      <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-forest-500/15 text-forest-500">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-6 font-serif text-2xl text-forest-900">
              {title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-forest-500/75">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
