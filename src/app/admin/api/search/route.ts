import { NextResponse } from "next/server";
import { getLeads, type CrmLead } from "@/lib/data/leads";
import { getAllObjects } from "@/lib/data/objects";
import { getGuidePages } from "@/lib/data/guide";
import { ADMIN_SECTIONS } from "@/lib/admin-sections";
import type { RealEstateObject } from "@/types/object";

export const dynamic = "force-dynamic";

/** One palette hit: what to show and where Enter takes you. */
export interface SearchHit {
  kind: "lead" | "object" | "page";
  title: string;
  subtitle?: string;
  href: string;
}

// Static admin destinations — always searchable, no data fetch needed.
// Разделы приходят из единого реестра ADMIN_SECTIONS (label + keywords),
// чтобы палитра не отставала от навигации; здесь остаются только
// страницы-действия, которые разделами не являются.
const PAGES: { title: string; keywords: string; href: string }[] = [
  ...ADMIN_SECTIONS.map((s) => ({ title: s.label, keywords: s.keywords ?? "", href: s.href as string })),
  { title: "Новый лид", keywords: "new lead добавить лид", href: "/admin/crm/new" },
  { title: "Дубли контактов", keywords: "dupes дубли merge слить", href: "/admin/crm/contacts/dupes" },
];

// The backend lists change slowly relative to keystrokes — cache one minute
// per warm lambda so a typing burst costs one backend roundtrip, not ten.
let cache: { at: number; leads: CrmLead[]; objects: RealEstateObject[] } | null = null;
const TTL = 60_000;

async function getData() {
  if (cache && Date.now() - cache.at < TTL) return cache;
  const [leads, objects] = await Promise.all([getLeads(), getAllObjects()]);
  cache = { at: Date.now(), leads, objects };
  return cache;
}

function matches(haystack: (string | null | undefined)[], q: string): boolean {
  return haystack.filter(Boolean).join(" ").toLowerCase().includes(q);
}

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ hits: [] as SearchHit[] });

  const { leads, objects } = await getData();
  const hits: SearchHit[] = [];

  for (const p of PAGES) {
    if (matches([p.title, p.keywords], q)) {
      hits.push({ kind: "page", title: p.title, subtitle: "страница", href: p.href });
    }
  }

  // Страницы справочника — полнотекстовый поиск (заголовок/аннотация/keywords
  // + тело страницы). Файлы маленькие, читаются с диска на каждый запрос.
  // Совпадение в мете показываем как "справочник", только в теле — помечаем
  // "в тексте", чтобы было понятно, почему страница нашлась.
  try {
    for (const g of getGuidePages()) {
      const inMeta = matches([g.title, g.summary, g.keywords, "справочник guide"], q);
      const inBody = !inMeta && matches([g.body], q);
      if (inMeta || inBody) {
        hits.push({
          kind: "page",
          title: `Справочник · ${g.title}`,
          subtitle: inBody ? "справочник · в тексте" : "справочник",
          href: `/admin/guide/${g.slug}`,
        });
      }
    }
  } catch {
    /* справочник недоступен — поиск работает дальше */
  }

  let n = 0;
  for (const l of leads) {
    if (n >= 8) break;
    if (matches([l.contactName, l.name, l.phone, l.email, l.rwNumber, (l.tags ?? []).join(" ")], q)) {
      hits.push({
        kind: "lead",
        title: l.contactName || l.name,
        subtitle: ["лид", l.stage, l.phone].filter(Boolean).join(" · "),
        href: `/admin/crm/${l.id}`,
      });
      n++;
    }
  }

  n = 0;
  for (const o of objects) {
    if (n >= 8) break;
    if (matches([o.rwNumber, o.titleEn, o.district], q)) {
      hits.push({
        kind: "object",
        title: `${o.rwNumber} · ${o.titleEn || o.type}`,
        subtitle: ["объект", o.status, o.district].filter(Boolean).join(" · "),
        href: `/object/${o.rwNumber}`,
      });
      n++;
    }
  }

  return NextResponse.json({ hits: hits.slice(0, 20) });
}
