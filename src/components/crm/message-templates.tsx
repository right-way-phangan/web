"use client";

import { useState } from "react";

/**
 * Quick message templates on the lead card: pick one → copy / open WhatsApp
 * with the text prefilled (name + linked object substituted). RU/EN toggle —
 * island clientele is mixed.
 */
export function MessageTemplates({
  contactName,
  phone,
  objectTitle,
  objectRw,
}: {
  contactName?: string | null;
  phone?: string | null;
  objectTitle?: string | null;
  objectRw?: string | null;
}) {
  const [lang, setLang] = useState<"en" | "ru">("en");
  const [copiedKey, setCopiedKey] = useState("");

  const name = contactName || (lang === "ru" ? "Здравствуйте" : "Hello");
  const objLine = objectTitle && objectRw
    ? `${objectTitle} — https://rightwaygroup.co/object/${objectRw}`
    : null;

  const T: Record<string, { label: string; text: string }> = lang === "ru"
    ? {
        greet: {
          label: "Приветствие",
          text: `${name}, добрый день! Это Right Way Phangan — недвижимость на Пангане. Получили ваш запрос${objLine ? ` по объекту:\n${objLine}` : ""}. Когда удобно созвониться или встретиться?`,
        },
        after: {
          label: "После показа",
          text: `${name}, спасибо за встречу! Как впечатления${objectTitle ? ` от «${objectTitle}»` : ""}? Готов ответить на любые вопросы по документам, условиям и следующим шагам.`,
        },
        follow: {
          label: "Напоминание",
          text: `${name}, на связи Right Way Phangan. Хотел узнать, актуален ли ещё поиск? Появились новые варианты — могу прислать подборку.`,
        },
      }
    : {
        greet: {
          label: "Greeting",
          text: `${name}, this is Right Way Phangan — real estate on Koh Phangan. We received your enquiry${objLine ? ` about:\n${objLine}` : ""}. When would be a good time for a call or a viewing?`,
        },
        after: {
          label: "After viewing",
          text: `${name}, thank you for the viewing today${objectTitle ? ` of ${objectTitle}` : ""}! Happy to answer any questions about the paperwork, terms and next steps.`,
        },
        follow: {
          label: "Follow-up",
          text: `${name}, Right Way Phangan here. Just checking in — are you still looking? We have new options that might fit, happy to send a selection.`,
        },
      };

  const digits = (phone ?? "").replace(/\D/g, "");

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-forest-900/40">Шаблоны:</span>
      {Object.entries(T).map(([key, t]) => (
        <span key={key} className="flex items-center overflow-hidden rounded-full border border-forest-900/15">
          <button
            type="button"
            onClick={() => copy(key, t.text)}
            title="Скопировать текст"
            className="px-2.5 py-1 text-xs text-forest-900/70 hover:bg-forest-900/5"
          >
            {copiedKey === key ? "✓" : t.label}
          </button>
          {digits.length >= 7 && (
            <a
              href={`https://wa.me/${digits}?text=${encodeURIComponent(t.text)}`}
              target="_blank"
              rel="noreferrer"
              title="Отправить в WhatsApp"
              className="border-l border-forest-900/10 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-500/20"
            >
              WA
            </a>
          )}
        </span>
      ))}
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "ru" : "en")}
        className="rounded-full bg-forest-900/5 px-2 py-1 text-[11px] font-medium text-forest-900/55 hover:bg-forest-900/10"
      >
        {lang.toUpperCase()}
      </button>
    </div>
  );
}
