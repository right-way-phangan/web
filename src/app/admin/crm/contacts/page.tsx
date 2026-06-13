import type { Metadata } from "next";
import Link from "next/link";
import { getContacts, CRM_ENABLED } from "@/lib/data/leads";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "CRM — контакты",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The contact book — every person the agency knows (site leads, manual,
 * imports, the legacy amo book), with lead counters and a jump to the latest
 * lead. Search covers name / phone / email.
 */
export default async function CrmContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const all = CRM_ENABLED ? await getContacts() : [];
  const contacts = query
    ? all.filter((c) =>
        [c.name, c.phone, c.email].filter(Boolean).join(" ").toLowerCase().includes(query),
      )
    : all;
  const withLeads = all.filter((c) => c.leadsCount > 0).length;

  return (
    <section className="px-4 py-8 md:px-8">
      <AdminNav active="crm" />
      <Link href={{ pathname: "/admin/crm" }} className="text-xs text-forest-900/50 hover:text-forest-900">
        ← Доска лидов
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-forest-900 md:text-3xl">Контакты</h1>
          <p className="mt-1 text-sm text-forest-900/60">
            {query ? `${contacts.length} из ${all.length}` : all.length} контакт(ов) · с лидами —{" "}
            {withLeads}. Вся книга, включая перенесённую из amoCRM.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={{ pathname: "/admin/crm/contacts/dupes" }}
            className="rounded-full border border-forest-900/15 px-3 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
          >
            👯 Дубли
          </Link>
          <Link
            href={{ pathname: "/admin/crm/new" }}
            className="rounded-full bg-forest-900 px-4 py-2 text-sm font-medium text-white hover:bg-forest-900/90"
          >
            + Новый лид
          </Link>
        </div>
      </div>

      <form action="/admin/crm/contacts" className="mt-4 flex w-full max-w-md items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Имя, телефон, email…"
          className="w-full rounded-full border border-forest-900/15 bg-white px-4 py-2 text-sm outline-none focus:border-brass-500"
        />
        <button
          type="submit"
          className="rounded-full border border-forest-900/15 px-4 py-2 text-sm font-medium text-forest-900/70 hover:bg-forest-900/5"
        >
          Найти
        </button>
      </form>

      {!CRM_ENABLED ? (
        <p className="mt-6 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : contacts.length === 0 ? (
        <p className="mt-6 text-sm text-forest-900/55">
          {query ? "Никого не нашлось — попробуйте короче." : "Книга пуста."}
        </p>
      ) : (
        <ul className="mt-6 space-y-1.5">
          {contacts.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-forest-900/10 bg-white px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate font-medium text-forest-900">
                {c.name || "Без имени"}
              </span>
              {c.phone && (
                <a
                  href={`tel:${c.phone}`}
                  className="shrink-0 text-xs text-forest-900/60 hover:text-forest-900"
                >
                  📞 {c.phone}
                </a>
              )}
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="hidden shrink-0 text-xs text-forest-900/60 hover:text-forest-900 sm:inline"
                >
                  ✉️ {c.email}
                </a>
              )}
              {c.leadsCount > 0 ? (
                <span className="flex shrink-0 items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.openLeads > 0
                        ? "bg-brass-500/15 font-medium text-brass-700"
                        : "bg-forest-900/5 text-forest-900/50"
                    }`}
                  >
                    {c.leadsCount === 1 ? "1 лид" : `${c.leadsCount} лид.`}
                    {c.openLeads > 0 && c.leadsCount > 1 ? ` · ${c.openLeads} откр.` : ""}
                  </span>
                  {c.lastLeadId != null && (
                    <Link
                      href={{ pathname: `/admin/crm/${c.lastLeadId}` }}
                      className="text-xs text-brass-600 hover:underline"
                    >
                      → лид
                    </Link>
                  )}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-forest-900/5 px-2 py-0.5 text-xs text-forest-900/40">
                  без лидов
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
