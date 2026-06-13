import { NextResponse } from "next/server";
import { getLeads, type CrmLead } from "@/lib/data/leads";
import { getAllObjects } from "@/lib/data/objects";
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
const PAGES: { title: string; keywords: string; href: string }[] = [
  { title: "Доска лидов", keywords: "crm борд лиды доска", href: "/admin/crm" },
  { title: "Задачи", keywords: "tasks задачи снуз", href: "/admin/crm/tasks" },
  { title: "Контакты", keywords: "contacts книга телефоны", href: "/admin/crm/contacts" },
  { title: "Новый лид", keywords: "new lead добавить лид", href: "/admin/crm/new" },
  { title: "Импорт лидов (CSV)", keywords: "import csv импорт", href: "/admin/crm/import" },
  { title: "Объекты", keywords: "objects каталог объекты", href: "/admin/objects" },
  { title: "Новый объект", keywords: "new object добавить объект", href: "/admin/new" },
  { title: "Финансы", keywords: "finance деньги opex журнал сделок", href: "/admin/finance" },
  { title: "Статьи", keywords: "articles блог статьи", href: "/admin/articles" },
  { title: "Дашборд", keywords: "dashboard главная сводка", href: "/admin" },
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
