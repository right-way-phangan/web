"use client";

import { useState } from "react";

/** Strip everything but digits and a leading +. wa.me wants digits only. */
function digits(s: string): string {
  return s.replace(/[^\d]/g, "");
}

/**
 * One-tap contact actions on a lead card — call, WhatsApp, email, copy. Built
 * for the agent on a phone: tap to dial or open a chat with the lead instantly.
 * tel:/mailto:/wa.me are plain links; copy needs a tiny bit of client JS.
 */
export function ContactActions({
  phone,
  email,
}: {
  phone?: string | null;
  email?: string | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition";
  const tel = phone ? digits(phone) : "";

  if (!phone && !email) {
    return <p className="text-xs text-forest-900/40">Нет контактов — добавьте телефон/email.</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {phone && (
        <>
          <a href={`tel:${tel}`} className={btn + " bg-forest-900 text-white hover:bg-forest-900/90"}>
            📞 Позвонить
          </a>
          <a
            href={`https://wa.me/${tel}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btn + " bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"}
          >
            🟢 WhatsApp
          </a>
          <button
            type="button"
            onClick={() => copy(phone, "phone")}
            className={btn + " bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10"}
          >
            📋 {copied === "phone" ? "Скопировано" : "Телефон"}
          </button>
        </>
      )}
      {email && (
        <>
          <a
            href={`mailto:${email}`}
            className={btn + " bg-brass-500/15 text-brass-600 hover:bg-brass-500/25"}
          >
            ✉️ Email
          </a>
          <button
            type="button"
            onClick={() => copy(email, "email")}
            className={btn + " bg-forest-900/5 text-forest-900/70 hover:bg-forest-900/10"}
          >
            📋 {copied === "email" ? "Скопировано" : "Адрес"}
          </button>
        </>
      )}
    </div>
  );
}
