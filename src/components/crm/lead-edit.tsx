"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadContactAction, deleteLeadAction } from "@/lib/actions/lead-actions";

/**
 * Inline editor for a lead's contact details + linked object on the detail
 * card. Saves via updateLeadContactAction; a guarded delete button removes
 * test leads (deleteLeadAction redirects back to the board).
 */
export function LeadEdit({
  leadId,
  contactName,
  email,
  phone,
  rwNumber,
}: {
  leadId: number;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  rwNumber?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const [name, setName] = useState(contactName ?? "");
  const [mail, setMail] = useState(email ?? "");
  const [tel, setTel] = useState(phone ?? "");
  const [rw, setRw] = useState(rwNumber ?? "");

  function save() {
    setMsg(null);
    start(async () => {
      const res = await updateLeadContactAction(leadId, {
        contactName: name,
        email: mail,
        phone: tel,
        rwNumber: rw,
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setMsg(res.error ?? "Не удалось сохранить.");
      }
    });
  }

  const field =
    "w-full rounded-md border border-forest-900/15 bg-white px-2.5 py-1.5 text-sm text-forest-900 outline-none focus:border-brass-500";
  const labelCls = "block text-xs font-medium text-forest-900/55";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-forest-900/5 px-3 py-1.5 text-xs font-medium text-forest-900/70 hover:bg-forest-900/10"
      >
        ✎ Редактировать контакт
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-forest-900/10 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={labelCls}>Имя контакта</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Объект (RW)</span>
          <input
            value={rw}
            onChange={(e) => setRw(e.target.value)}
            placeholder="RW-L0001"
            className={field}
          />
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Email</span>
          <input value={mail} onChange={(e) => setMail(e.target.value)} className={field} />
        </label>
        <label className="space-y-1">
          <span className={labelCls}>Телефон</span>
          <input value={tel} onChange={(e) => setTel(e.target.value)} className={field} />
        </label>
      </div>

      {msg && <p className="mt-2 text-xs text-red-700">{msg}</p>}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-full bg-forest-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-900/90 disabled:opacity-50"
        >
          {pending ? "Сохраняю…" : "Сохранить"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-forest-900/60 hover:bg-forest-900/5"
        >
          Отмена
        </button>

        <form
          action={deleteLeadAction}
          className="ml-auto"
          onSubmit={(e) => {
            if (!confirm("Удалить лид безвозвратно? Заметки и задачи тоже удалятся.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="leadId" value={leadId} />
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/10"
          >
            Удалить лид
          </button>
        </form>
      </div>
    </div>
  );
}
