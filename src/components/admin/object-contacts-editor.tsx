"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Star, Save, Phone } from "lucide-react";
import { saveObjectContacts } from "@/lib/actions/object-contacts";
import type { ContactRole, ObjectContact } from "@/types/object";

const ROLES: { key: ContactRole; label: string }[] = [
  { key: "owner", label: "Собственник" },
  { key: "broker", label: "Посредник / брокер" },
  { key: "caretaker", label: "Смотритель / ключи" },
  { key: "lawyer", label: "Юрист" },
  { key: "other", label: "Другое" },
];

/** Локальная строка: контакт + стабильный ключ для React (на сервер не уходит). */
interface Row extends ObjectContact {
  _key: number;
}

let keySeq = 0;
const withKey = (c: ObjectContact): Row => ({ ...c, _key: keySeq++ });
const emptyRow = (): Row => withKey({ role: "owner" });

const inputCls =
  "min-h-[40px] w-full rounded-sm border border-forest-900/15 bg-cream-50 px-2.5 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500";

/**
 * Редактор контактов продавца по объекту («кто собственник / с кем связываться»).
 * Несколько контактов с ролями + каналы отдельными полями (телефон/LINE/
 * WhatsApp/Telegram). Сохраняет весь список целиком (replace) через server
 * action. НЕ публичное — живёт только в /admin.
 */
export function ObjectContactsEditor({
  rwNumber,
  initial,
}: {
  rwNumber: string;
  initial: ObjectContact[];
}) {
  const [rows, setRows] = useState<Row[]>(
    initial.length ? initial.map(withKey) : [emptyRow()],
  );
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function patch(key: number, field: keyof ObjectContact, value: string | boolean) {
    setRows((rs) => rs.map((r) => (r._key === key ? { ...r, [field]: value } : r)));
    setDirty(true);
    setSaved(false);
  }
  function setPrimary(key: number) {
    setRows((rs) => rs.map((r) => ({ ...r, isPrimary: r._key === key })));
    setDirty(true);
    setSaved(false);
  }
  function addRow() {
    setRows((rs) => [...rs, emptyRow()]);
    setDirty(true);
    setSaved(false);
  }
  function removeRow(key: number) {
    setRows((rs) => rs.filter((r) => r._key !== key));
    setDirty(true);
    setSaved(false);
  }

  function save() {
    setError(null);
    const payload: ObjectContact[] = rows.map(({ _key: _drop, ...c }) => c);
    start(async () => {
      const res = await saveObjectContacts(rwNumber, payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRows(res.contacts.length ? res.contacts.map(withKey) : [emptyRow()]);
      setDirty(false);
      setSaved(true);
    });
  }

  return (
    <div className="rounded-xl border border-forest-900/10 bg-cream-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-forest-900/60">
          <Phone className="h-4 w-4" /> Контакты · с кем связываться
        </h2>
        {saved && !dirty ? (
          <span className="text-xs text-emerald-700">Сохранено ✓</span>
        ) : null}
      </div>

      <p className="mb-3 text-xs text-forest-900/45">
        Собственник, посредник, смотритель с ключами, юрист — у каждого своя роль и каналы. Эти
        данные конфиденциальны: на сайт не попадают. ★ — основной контакт (показывается в обзвоне и
        списке объектов).
      </p>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r._key}
            className={
              "rounded-sm border p-3 " +
              (r.isPrimary
                ? "border-brass-500/40 bg-brass-500/[0.05]"
                : "border-forest-900/10 bg-forest-900/[0.015]")
            }
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <select
                value={r.role}
                onChange={(e) => patch(r._key, "role", e.target.value)}
                className="min-h-[36px] rounded-sm border border-forest-900/15 bg-cream-50 px-2 py-1 text-sm font-medium text-forest-900"
              >
                {ROLES.map((ro) => (
                  <option key={ro.key} value={ro.key}>
                    {ro.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPrimary(r._key)}
                title="Сделать основным контактом"
                className={
                  "inline-flex min-h-[36px] items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium transition " +
                  (r.isPrimary
                    ? "bg-brass-500/20 text-brass-700"
                    : "bg-forest-900/5 text-forest-900/60 hover:bg-forest-900/10")
                }
              >
                <Star className={"h-3.5 w-3.5 " + (r.isPrimary ? "fill-brass-500" : "")} />
                {r.isPrimary ? "Основной" : "Сделать основным"}
              </button>
              <button
                type="button"
                onClick={() => removeRow(r._key)}
                title="Удалить контакт"
                className="ml-auto inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-sm text-forest-900/40 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={r.name ?? ""}
                onChange={(e) => patch(r._key, "name", e.target.value)}
                placeholder="Имя"
                className={inputCls}
              />
              <input
                value={r.phone ?? ""}
                onChange={(e) => patch(r._key, "phone", e.target.value)}
                placeholder="Телефон"
                inputMode="tel"
                className={inputCls}
              />
              <input
                value={r.line ?? ""}
                onChange={(e) => patch(r._key, "line", e.target.value)}
                placeholder="LINE ID"
                className={inputCls}
              />
              <input
                value={r.whatsapp ?? ""}
                onChange={(e) => patch(r._key, "whatsapp", e.target.value)}
                placeholder="WhatsApp"
                inputMode="tel"
                className={inputCls}
              />
              <input
                value={r.telegram ?? ""}
                onChange={(e) => patch(r._key, "telegram", e.target.value)}
                placeholder="Telegram (@username)"
                className={inputCls}
              />
              <input
                value={r.note ?? ""}
                onChange={(e) => patch(r._key, "note", e.target.value)}
                placeholder="Заметка (язык, удобное время…)"
                className={inputCls}
              />
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="mt-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm bg-forest-900/5 px-3 py-2 text-sm font-medium text-forest-900 hover:bg-forest-900/10"
        >
          <Plus className="h-4 w-4" /> Добавить контакт
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-sm bg-panel px-4 py-2 text-sm font-medium text-panel-fg transition hover:bg-panel/90 disabled:opacity-40"
        >
          <Save className="h-4 w-4" /> {busy ? "Сохраняю…" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
