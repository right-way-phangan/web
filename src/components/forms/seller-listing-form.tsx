"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useFormStatus } from "react-dom";
import { track } from "@vercel/analytics";
import { track as gtmTrack } from "@/lib/analytics/track";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitSellerListing, type SellerFormState } from "@/lib/actions/seller-listing";
import { PROPERTY_TYPES, TENURES } from "@/lib/crm/seller-lead";
import { getAttribution } from "@/lib/analytics/attribution";
import { getVid } from "@/lib/analytics/visitor";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { cn } from "@/lib/utils/cn";

type Locale = "en" | "ru";

const initialState: SellerFormState = { status: "idle" };

/** Bilingual copy — kept inline so the whole seller form is self-contained. */
const COPY: Record<Locale, {
  name: string;
  phone: string;
  email: string;
  contactHint: string;
  type: string;
  types: Record<(typeof PROPERTY_TYPES)[number], string>;
  location: string;
  locationPh: string;
  size: string;
  sizePh: string;
  tenure: string;
  tenures: Record<(typeof TENURES)[number], string>;
  tenurePick: string;
  price: string;
  pricePh: string;
  hasDocs: string;
  replyVia: string;
  message: string;
  messagePh: string;
  submit: string;
  sending: string;
  privacy: string;
  privacyLink: string;
  successTitle: string;
  successLede: string;
}> = {
  en: {
    name: "Your name",
    phone: "Phone",
    email: "Email",
    contactHint: "Leave a phone or email so we can reply.",
    type: "Property type",
    types: { land: "Land", villa: "Villa", house: "House", apartment: "Apartment", project: "Off-plan project" },
    location: "Location on Phangan",
    locationPh: "e.g. Haad Yao, Sri Thanu, Chaloklum…",
    size: "Size",
    sizePh: "e.g. 2 rai, or 180 sqm built",
    tenure: "Ownership",
    tenures: { freehold: "Freehold", leasehold: "Leasehold", either: "Freehold or leasehold", unsure: "Not sure" },
    tenurePick: "Select…",
    price: "Asking price",
    pricePh: "e.g. 8,000,000 THB — or negotiable",
    hasDocs: "I have the title document (chanote / lease) to hand",
    replyVia: "Reply to me via",
    message: "Anything else (optional)",
    messagePh: "Access road, utilities, why you're selling, a link to photos or location…",
    submit: "Submit my property",
    sending: "Sending…",
    privacy: "By submitting you agree to our",
    privacyLink: "privacy policy",
    successTitle: "Got it — thank you.",
    successLede: "We'll review your property and come back within the working day. You can also reach us directly:",
  },
  ru: {
    name: "Ваше имя",
    phone: "Телефон",
    email: "Email",
    contactHint: "Оставьте телефон или email, чтобы мы могли ответить.",
    type: "Тип объекта",
    types: { land: "Земля", villa: "Вилла", house: "Дом", apartment: "Апартаменты", project: "Проект (off-plan)" },
    location: "Локация на Пангане",
    locationPh: "напр. Haad Yao, Sri Thanu, Chaloklum…",
    size: "Площадь",
    sizePh: "напр. 2 рай, или 180 м² постройки",
    tenure: "Владение",
    tenures: { freehold: "Freehold", leasehold: "Leasehold", either: "Freehold или leasehold", unsure: "Не знаю" },
    tenurePick: "Выберите…",
    price: "Ожидаемая цена",
    pricePh: "напр. 8 000 000 THB — или договорная",
    hasDocs: "У меня на руках документ на объект (чанот / договор лизинга)",
    replyVia: "Куда ответить",
    message: "Что-то ещё (необязательно)",
    messagePh: "Подъезд, коммуникации, причина продажи, ссылка на фото или локацию…",
    submit: "Отправить объект",
    sending: "Отправляем…",
    privacy: "Отправляя, вы соглашаетесь с",
    privacyLink: "политикой конфиденциальности",
    successTitle: "Принято — спасибо.",
    successLede: "Мы изучим ваш объект и вернёмся в течение рабочего дня. Также можно написать напрямую:",
  },
};

interface Props {
  locale?: Locale;
}

export function SellerListingForm({ locale = "en" }: Props) {
  const t = COPY[locale];
  const [state, formAction] = useActionState(submitSellerListing, initialState);

  // Anonymous visitor id + first-touch attribution — set after mount to avoid
  // an SSR hydration mismatch, injected as hidden fields for the note/tags.
  const [vid, setVid] = useState("");
  const [attr, setAttr] = useState<{ source?: string; medium?: string; campaign?: string; landing?: string }>({});
  useEffect(() => {
    setVid(getVid() ?? "");
    const a = getAttribution();
    if (a) setAttr({ source: a.source, medium: a.medium, campaign: a.campaign, landing: a.landing });
  }, []);

  // Reply-channel ↔ contact nudge: asking us to reply on WhatsApp/Telegram
  // without a phone is a dead end (soft hint — email is still a valid fallback).
  const [replyVia, setReplyVia] = useState("");
  const [hasPhone, setHasPhone] = useState(false);
  const needsPhone = (replyVia === "whatsapp" || replyVia === "telegram") && !hasPhone;

  useEffect(() => {
    if (state.status === "ok") {
      track("inquiry_submitted", { source: "sell", kind: "seller-listing" });
      gtmTrack("lead_submit", { source: "sell", kind: "seller-listing" });
    }
  }, [state.status]);

  const fieldError = (key: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[key]?.[0] : undefined;

  if (state.status === "ok") {
    return (
      <div className="rounded-sm border border-forest-500/15 bg-cream-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-forest-500" />
        <h3 className="mt-3 font-serif text-xl text-forest-900">{t.successTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-forest-500/75">{t.successLede}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-forest-500/20 px-4 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:border-forest-500/40"
          >
            WhatsApp
          </a>
          <a
            href={telegramDmLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-forest-500/20 px-4 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:border-forest-500/40"
          >
            Telegram
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" aria-label="Property submission">
      {/* Hidden context */}
      <input type="hidden" name="lang" value={locale} />
      {vid ? <input type="hidden" name="vid" value={vid} /> : null}
      {attr.source ? <input type="hidden" name="utm_source" value={attr.source} /> : null}
      {attr.medium ? <input type="hidden" name="utm_medium" value={attr.medium} /> : null}
      {attr.campaign ? <input type="hidden" name="utm_campaign" value={attr.campaign} /> : null}
      {attr.landing ? <input type="hidden" name="landing" value={attr.landing} /> : null}
      {/* Honeypot — real users never see or fill this */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <FieldRow>
        <Label htmlFor="seller-name">{t.name}</Label>
        <Input id="seller-name" name="name" autoComplete="name" aria-invalid={!!fieldError("name")} />
        <FieldError msg={fieldError("name")} />
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow>
          <Label htmlFor="seller-phone">{t.phone}</Label>
          <Input
            id="seller-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            onChange={(e) => setHasPhone(e.target.value.trim().length > 0)}
            aria-invalid={!!fieldError("phone")}
          />
        </FieldRow>
        <FieldRow>
          <Label htmlFor="seller-email">{t.email}</Label>
          <Input id="seller-email" name="email" type="email" autoComplete="email" aria-invalid={!!fieldError("email")} />
        </FieldRow>
      </div>
      <p className="text-xs text-forest-500/60">{t.contactHint}</p>
      <FieldError msg={fieldError("phone")} />
      <FieldError msg={fieldError("email")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow>
          <Label htmlFor="seller-type">{t.type}</Label>
          <SelectBox id="seller-type" name="propertyType" defaultValue="land" aria-invalid={!!fieldError("propertyType")}>
            {PROPERTY_TYPES.map((v) => (
              <option key={v} value={v}>
                {t.types[v]}
              </option>
            ))}
          </SelectBox>
          <FieldError msg={fieldError("propertyType")} />
        </FieldRow>
        <FieldRow>
          <Label htmlFor="seller-tenure">{t.tenure}</Label>
          <SelectBox id="seller-tenure" name="tenure" defaultValue="">
            <option value="">{t.tenurePick}</option>
            {TENURES.map((v) => (
              <option key={v} value={v}>
                {t.tenures[v]}
              </option>
            ))}
          </SelectBox>
        </FieldRow>
      </div>

      <FieldRow>
        <Label htmlFor="seller-location">{t.location}</Label>
        <Input id="seller-location" name="location" placeholder={t.locationPh} aria-invalid={!!fieldError("location")} />
        <FieldError msg={fieldError("location")} />
      </FieldRow>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow>
          <Label htmlFor="seller-size">{t.size}</Label>
          <Input id="seller-size" name="size" placeholder={t.sizePh} />
        </FieldRow>
        <FieldRow>
          <Label htmlFor="seller-price">{t.price}</Label>
          <Input id="seller-price" name="price" placeholder={t.pricePh} />
        </FieldRow>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-forest-500/85">
        <input type="checkbox" name="hasDocs" value="yes" className="h-4 w-4 accent-forest-500" />
        {t.hasDocs}
      </label>

      <FieldRow>
        <span className="text-sm font-medium text-forest-900">{t.replyVia}</span>
        <div className="flex gap-2" role="radiogroup" aria-label={t.replyVia}>
          {(["whatsapp", "telegram", "email"] as const).map((ch) => (
            <label
              key={ch}
              className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-sm border border-forest-500/20 px-2 py-2 text-center text-xs font-medium text-forest-500 transition-colors has-[:checked]:border-forest-500 has-[:checked]:bg-panel has-[:checked]:text-panel-fg"
            >
              <input
                type="radio"
                name="replyVia"
                value={ch}
                className="sr-only"
                onChange={(e) => setReplyVia(e.target.value)}
              />
              {ch === "whatsapp" ? "WhatsApp" : ch === "telegram" ? "Telegram" : "Email"}
            </label>
          ))}
        </div>
        {needsPhone ? <p className="text-xs text-brass-500">{t.contactHint}</p> : null}
      </FieldRow>

      <FieldRow>
        <Label htmlFor="seller-message">{t.message}</Label>
        <Textarea id="seller-message" name="message" rows={4} placeholder={t.messagePh} />
      </FieldRow>

      {state.status === "error" && state.message ? <ErrorBanner message={state.message} /> : null}

      <SubmitButton label={t.submit} sendingLabel={t.sending} />

      {/* Согласие на обработку данных — см. lead-form: было 11px/50%, ~2.6:1. */}
      <p className="text-center text-xs text-forest-500/80">
        {t.privacy}{" "}
        <Link
          href={(locale === "ru" ? "/ru/privacy" : "/privacy") as Route}
          className="underline underline-offset-2 hover:text-brass-500"
        >
          {t.privacyLink}
        </Link>
        .
      </p>
    </form>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-700/80">{msg}</p>;
}

/** Native <select> styled to match the Input primitive. */
function SelectBox({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-sm border border-forest-500/20 bg-cream-50 px-4 py-2 text-sm text-forest-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/30 focus-visible:border-forest-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function SubmitButton({ label, sendingLabel }: { label: string; sendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" className="w-full" disabled={pending}>
      <Send className="h-4 w-4" />
      {pending ? sendingLabel : label}
    </Button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-sm border border-red-700/20 bg-red-50/40 p-3 text-sm text-red-900/80">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700/70" />
      <span>{message}</span>
    </div>
  );
}
