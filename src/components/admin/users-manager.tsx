"use client";

import { useState, useTransition } from "react";
import { deleteUserAction, saveUserAction, setUserLangAction } from "@/lib/actions/users";
import type { AdminUser } from "@/lib/data/users";

const input =
  "w-full rounded-sm border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm text-forest-900 placeholder:text-forest-500/50";
const btn = "rounded-sm px-3 py-1.5 text-sm font-medium transition disabled:opacity-50";
const ROLE = { admin: "Администратор", agent: "Агент", partner: "Партнёр (застройщик)" } as const;
const LANGS = [
  { v: "", l: "Русский" },
  { v: "en", l: "English" },
  { v: "th", l: "ไทย" },
];

export function UsersManager({ users }: { users: AdminUser[] }) {
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "agent" as "agent" | "admin", lang: "th" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) {
    setMsg(null);
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? { ok: true, text: okText } : { ok: false, text: r.error ?? "Ошибка" });
      if (r.ok) after?.();
    });
  }

  return (
    <div className="space-y-6">
      {msg ? (
        <p className={`rounded-sm px-3 py-2 text-sm ${msg.ok ? "bg-forest-50 text-forest-900" : "bg-red-50 text-red-700"}`}>{msg.text}</p>
      ) : null}

      <form
        className="grid gap-2 rounded-sm border border-forest-900/10 bg-cream-50 p-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveUserAction(form), `Готово: ${form.email}. Передай логин и пароль лично.`, () =>
            setForm((f) => ({ ...f, email: "", password: "", name: "" })),
          );
        }}
      >
        <p className="text-sm font-semibold text-forest-900 sm:col-span-2">Новый аккаунт / сброс пароля</p>
        <input className={input} type="email" required placeholder="Email (логин)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={input} placeholder="Имя (видно в CRM)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={input} type="text" required minLength={8} placeholder="Пароль, от 8 символов" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="flex gap-2">
          <select className={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "agent" | "admin" })}>
            <option value="agent">Агент</option>
            <option value="admin">Администратор</option>
          </select>
          <select className={input} value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })} aria-label="Язык интерфейса">
            {LANGS.map((l) => (
              <option key={l.v} value={l.v}>{l.l}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button disabled={pending} className={`${btn} bg-panel text-panel-fg`}>Сохранить</button>
        </div>
      </form>

      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm border border-forest-900/10 bg-cream-50 px-4 py-3 text-sm">
            <span className="font-semibold text-forest-900">{u.name || u.email}</span>
            <span className="text-forest-500">{u.email}</span>
            <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-xs">
              {ROLE[u.role]}
              {u.developer ? ` · ${u.developer}` : ""}
            </span>
            <span className="text-xs text-forest-500/70">#{u.id}</span>
            <select
              className="ml-auto rounded-sm border border-forest-900/15 bg-white px-2 py-1 text-xs"
              defaultValue={u.lang ?? ""}
              disabled={pending}
              onChange={(e) => run(() => setUserLangAction(u.id, e.target.value), "Язык сохранён. Агенту нужно выйти и войти заново.")}
              aria-label="Язык интерфейса"
            >
              {LANGS.map((l) => (
                <option key={l.v} value={l.v}>{l.l}</option>
              ))}
            </select>
            {u.role !== "admin" ? (
              <button
                disabled={pending}
                onClick={() => {
                  if (confirm(`Удалить доступ ${u.email}? Закреплённые лиды останутся в CRM.`)) run(() => deleteUserAction(u.id), "Доступ удалён.");
                }}
                className="text-xs text-red-700 hover:underline"
              >
                Удалить доступ
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
