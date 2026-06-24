import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  MapPin,
  CalendarClock,
  Building2,
  MessageCircle,
  Send,
  Coins,
  TrendingUp,
  Home,
  type LucideIcon,
} from "lucide-react";
import type { RealEstateObject } from "@/types/object";
import type { ProjectAvailability } from "@/lib/data/projects";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getProjectsDict } from "@/lib/i18n/dictionaries";
import { formatPriceTHB } from "@/lib/utils/price";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/motion/parallax";
import { ShareButton } from "@/components/objects/share-button";
import { SaveButton } from "@/components/objects/save-button";
import { StageBadge } from "./stage-badge";
import { AvailabilityBar } from "./availability-bar";

interface Props {
  project: RealEstateObject;
  availability: ProjectAvailability;
  locale: Locale;
  developerHref?: string;
}

/** Landing hero — title, developer, key stats and a lead CTA. */
export function ProjectHero({ project, availability, locale, developerHref }: Props) {
  const t = getProjectsDict(locale);
  const { total, available } = availability;

  const hasCover = !!project.coverImage;

  return (
    <section className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
      {/* Text */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-eyebrow text-brass-700">
            <span className="h-px w-7 bg-brass-600/60" aria-hidden />
            {project.rwNumber}
          </span>
          {/* When there's a cover, the stage badge lives on the image instead. */}
          {!hasCover ? <StageBadge stage={project.stage} locale={locale} /> : null}
          <div className="ml-auto flex items-center gap-2">
            <ShareButton rw={project.rwNumber} title={project.titleEn} />
            <SaveButton rw={project.rwNumber} variant="inline" />
          </div>
        </div>

        <h1 className="mt-4 text-balance">{project.titleEn}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-forest-500/70">
          {project.developer ? (
            developerHref ? (
              <Link
                href={developerHref as Route}
                className="inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:text-brass-500 hover:underline"
              >
                <Building2 className="h-4 w-4" />
                {project.developer}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {project.developer}
              </span>
            )
          ) : null}
          {project.district ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {project.district}
            </span>
          ) : null}
          {project.completion ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              {project.completion}
            </span>
          ) : null}
        </div>

        {/* Stats */}
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          {project.priceThb ? (
            <Stat icon={Coins} label={t.from} value={formatPriceTHB(project.priceThb)} />
          ) : null}
          {project.netYieldPct ? (
            <Stat icon={TrendingUp} label={t.sections.netYield} value={`~${project.netYieldPct}%`} />
          ) : null}
          {total != null ? (
            <Stat
              icon={Home}
              label={t.units}
              value={(available ?? 0) <= 0 ? t.soldOut : `${available}/${total}`}
            />
          ) : null}
        </dl>

        {total ? (
          <div className="mt-6 max-w-sm">
            <AvailabilityBar total={total} available={available} />
            {(available ?? 0) > 0 && (available ?? 0) <= 2 ? (
              <p className="mt-2 text-sm font-medium text-brass-600">{t.unitsLeft(available!)}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <a href="#enquire">{t.enquire}</a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={whatsappLink(t.contactMessage(project.titleEn))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href={telegramDmLink(`interest_${project.rwNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className="h-4 w-4" />
              Telegram
            </a>
          </Button>
        </div>
      </div>

      {/* Image — slow scroll-parallax behind a teal scrim + warm horizon glow */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-bezel bg-forest-500/5 shadow-soft lg:aspect-[5/4]">
        {hasCover ? (
          <>
            {/* Oversized so the parallax shift never bares an edge */}
            <Parallax speed={44} className="absolute -inset-y-[6%] inset-x-0">
              <Image
                src={project.coverImage!}
                alt={project.titleEn}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </Parallax>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-panel/45 via-transparent to-transparent" />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_85%_115%,rgba(217,138,30,0.16),transparent_60%)]"
              aria-hidden
            />
            <StageBadge
              stage={project.stage}
              locale={locale}
              className="absolute bottom-3 left-3 z-10 bg-cream-50/90 backdrop-blur-sm"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/20">
            <Building2 className="h-28 w-28" strokeWidth={0.8} />
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-forest-500/55">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </dt>
      <dd className="num mt-1 text-xl text-forest-900 sm:text-2xl">{value}</dd>
    </div>
  );
}
