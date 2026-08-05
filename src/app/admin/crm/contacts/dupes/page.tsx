import type { Metadata } from "next";
import Link from "next/link";
import { getContacts, CRM_ENABLED, type CrmContact } from "@/lib/data/leads";
import { MergeButton } from "@/components/crm/merge-button";

export const metadata: Metadata = {
  title: "CRM — дубли контактов",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Last 9 digits survive +66 / 0 prefix differences; min 7 to be a phone. */
function phoneKey(phone: string | null): string | null {
  const d = (phone ?? "").replace(/\D/g, "");
  return d.length >= 7 ? d.slice(-9) : null;
}

/**
 * Duplicate finder for the contact book: groups by normalized phone or
 * lowercased email. The amo import brought the whole book — dupes are
 * expected. Merge keeps the contact with more leads (or the older row).
 */
export default async function ContactDupesPage() {
  const all = CRM_ENABLED ? await getContacts() : [];

  const groups = new Map<string, CrmContact[]>();
  for (const c of all) {
    const keys = [
      phoneKey(c.phone) ? `p:${phoneKey(c.phone)}` : null,
      c.email ? `e:${c.email.trim().toLowerCase()}` : null,
    ].filter(Boolean) as string[];
    for (const k of keys) groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  // Keep groups with real duplicates; primary = most leads, then oldest id.
  const dupeGroups = [...groups.entries()]
    .filter(([, cs]) => cs.length > 1)
    .map(([key, cs]) => ({
      key,
      contacts: [...cs].sort((a, b) => b.leadsCount - a.leadsCount || a.id - b.id),
    }));

  return (
    <section className="px-4 py-8 md:px-8">
      <Link
        href={{ pathname: "/admin/crm/contacts" }}
        className="text-xs text-forest-900/50 hover:text-forest-900"
      >
        ← Контакты
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-forest-900 md:text-3xl">Дубли контактов</h1>
      <p className="mt-1 text-sm text-forest-900/60">
        {dupeGroups.length} групп(ы) по совпадению телефона/email. Слияние переносит лидов на
        основной контакт и удаляет дубль; пустые телефон/email доливаются из дубля.
      </p>

      {!CRM_ENABLED ? (
        <p className="mt-6 text-sm text-forest-900/55">CRM-бэкенд не подключён.</p>
      ) : dupeGroups.length === 0 ? (
        <p className="mt-6 text-sm text-forest-900/55">Дублей не найдено — книга чистая. ✨</p>
      ) : (
        <div className="mt-6 space-y-4">
          {dupeGroups.map(({ key, contacts }) => {
            const [primary] = contacts;
            return (
              <div key={key} className="rounded-2xl border border-forest-900/10 bg-cream-50 p-4">
                <p className="mb-2 text-xs text-forest-900/45">
                  совпадение: {key.startsWith("p:") ? `📞 …${key.slice(2)}` : `✉️ ${key.slice(2)}`}
                </p>
                <ul className="space-y-1.5">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-medium text-forest-900">
                        #{c.id} {c.name || "Без имени"}
                      </span>
                      {c.phone && <span className="text-xs text-forest-900/55">{c.phone}</span>}
                      {c.email && <span className="text-xs text-forest-900/55">{c.email}</span>}
                      <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-xs text-forest-900/50">
                        {c.leadsCount} лид.
                      </span>
                      {c.id === primary.id ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          основной
                        </span>
                      ) : (
                        <MergeButton keepId={primary.id} mergeId={c.id} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
