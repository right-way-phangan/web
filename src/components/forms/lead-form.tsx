"use client";

import { useActionState, useEffect, useState, useRef } from "react";
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
import { submitInquiry, type FormState } from "@/lib/actions/inquiry";
import { getAttribution } from "@/lib/analytics/attribution";
import { trackObjectEvent } from "@/lib/analytics/track-event";
import { getVid } from "@/lib/analytics/visitor";
import { getFormDict, type Locale } from "@/lib/i18n/dictionaries";
import { whatsappLink, telegramDmLink } from "@/lib/site-config";
import { cn } from "@/lib/utils/cn";

const initialState: FormState = { status: "idle" };

interface Props {
  /** Object inquiry: pass rwNumber + default message. Otherwise it's a /contact submission. */
  rwNumber?: string;
  /** Visible source discriminator (CRM tag + name prefix) */
  source: "object" | "contact";
  defaultMessage?: string;
  /** Visual layout. "card" = inquiry form sidebar; "block" = /contact full-width block */
  layout?: "card" | "block";
  /** "calculator" tags the lead as coming from the ROI calculator; "market-report" from /insights; "shortlist" from /saved; "saved-search" = a new-listing alert request; "valuation" = /tools/estimate seller lead; "construction" = developer-page build request. */
  kind?: "inquiry" | "calculator" | "market-report" | "shortlist" | "saved-search" | "valuation" | "construction" | "match";
  /** Developer lead tag (developer-page construction requests) — becomes a CRM tag. */
  developer?: string;
  /** Submit button label override. */
  submitLabel?: string;
  /** Show an optional "preferred viewing date" field (object pages). */
  showViewingDate?: boolean;
  /** Fired once after a successful submission — e.g. to unlock gated content. */
  onSuccess?: () => void;
  /** UI language for field labels/buttons. Server still stores the lead the same way. */
  locale?: Locale;
}

type FieldKey = "name" | "email" | "phone" | "message";

export function LeadForm({ rwNumber, source, defaultMessage, layout = "card", kind, developer, submitLabel, showViewingDate, onSuccess, locale = "en" }: Props) {
  const t = getFormDict(locale);
  // После маунта, как vid ниже: SSR-снимок мог быть отрендерен в другой день
  // (static prerender), min="" до маунта ничем не мешает.
  const [todayIso, setTodayIso] = useState("");
  useEffect(() => setTodayIso(new Date().toISOString().slice(0, 10)), []);
  const [state, formAction] = useActionState(submitInquiry, initialState);
  const utm = useUtmParams();
  const formRef = useRef<HTMLFormElement | null>(null);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  // Anonymous visitor id (client-only — localStorage) so the lead links to its
  // browse journey. Set after mount to avoid an SSR hydration mismatch.
  const [vid, setVid] = useState("");
  useEffect(() => setVid(getVid() ?? ""), []);
  // Reply-channel ↔ contact consistency: if the visitor asks us to reply on
  // WhatsApp/Telegram but leaves the phone empty, nudge for a number (soft —
  // never blocks; email is still a valid fallback).
  const [replyVia, setReplyVia] = useState<string>("");
  const [hasPhone, setHasPhone] = useState(false);
  const needsPhone = (replyVia === "whatsapp" || replyVia === "telegram") && !hasPhone;
  const listingsHref = (locale === "ru" ? "/ru/listings" : "/listings") as Route;

  // Top of the funnel: fire once when the form scrolls into view, so the
  // view → start → submit drop-off is measurable per surface (source/kind) in
  // Vercel Analytics — the biggest gap is people who see a form but never touch it.
  useEffect(() => {
    const el = formRef.current;
    if (!el || viewedRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !viewedRef.current) {
          viewedRef.current = true;
          track("form_view", { source, kind: kind ?? "inquiry" });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [source, kind]);

  // Form abandonment: one form_start the first time a visitor focuses any field,
  // paired with form_submit on success → start-vs-submit funnel in /admin/crm/stats.
  // The Vercel event carries source/kind so the funnel slices by surface.
  const onFirstInteraction = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("form_start", { source, kind: kind ?? "inquiry", rwNumber: rwNumber ?? "n/a" });
    trackObjectEvent("form_start", rwNumber);
  };

  // Reset form on success + emit analytics event
  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      track("inquiry_submitted", {
        source,
        rwNumber: rwNumber ?? "n/a",
        kind: kind ?? "inquiry",
      });
      // Marketing conversion → GTM (GA4 conversion + Meta Pixel Lead).
      gtmTrack("lead_submit", {
        source,
        rw: rwNumber ?? "n/a",
        kind: kind ?? "inquiry",
      });
      trackObjectEvent("form_submit", rwNumber);
      onSuccess?.();
    } else if (state.status === "error") {
      track("inquiry_error", { source, rwNumber: rwNumber ?? "n/a" });
    }
    // onSuccess intentionally omitted from deps — fire once per status change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, source, rwNumber, kind]);

  const fieldError = (key: FieldKey): string | undefined => {
    if (state.status !== "error") return undefined;
    return state.fieldErrors?.[key]?.[0];
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onFocusCapture={onFirstInteraction}
      className={cn(layout === "card" ? "space-y-4" : "space-y-5")}
      aria-label={rwNumber ? `Enquiry about ${rwNumber}` : "Contact form"}
    >
      {/* Hidden context */}
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="lang" value={locale} />
      {kind ? <input type="hidden" name="kind" value={kind} /> : null}
      {developer ? <input type="hidden" name="developer" value={developer} /> : null}
      {rwNumber ? <input type="hidden" name="rwNumber" value={rwNumber} /> : null}
      {vid ? <input type="hidden" name="vid" value={vid} /> : null}
      {utm.utm_source ? <input type="hidden" name="utm_source" value={utm.utm_source} /> : null}
      {utm.utm_medium ? <input type="hidden" name="utm_medium" value={utm.utm_medium} /> : null}
      {utm.utm_campaign ? <input type="hidden" name="utm_campaign" value={utm.utm_campaign} /> : null}
      {utm.utm_content ? <input type="hidden" name="utm_content" value={utm.utm_content} /> : null}
      {utm.utm_term ? <input type="hidden" name="utm_term" value={utm.utm_term} /> : null}
      {utm.referrer ? <input type="hidden" name="referrer" value={utm.referrer} /> : null}
      {utm.landing ? <input type="hidden" name="landing" value={utm.landing} /> : null}

      {/* Honeypot — invisible to humans, attractive to bots */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <FieldRow>
        <Label htmlFor={`name-${source}`}>{t.name}</Label>
        <Input
          id={`name-${source}`}
          name="name"
          placeholder={t.namePlaceholder}
          required
          aria-invalid={!!fieldError("name")}
        />
        <FieldError msg={fieldError("name")} />
      </FieldRow>

      <FieldRow>
        <Label htmlFor={`email-${source}`}>{t.email}</Label>
        <Input
          id={`email-${source}`}
          name="email"
          type="email"
          placeholder="you@email.com"
          aria-invalid={!!fieldError("email")}
        />
        <FieldError msg={fieldError("email")} />
      </FieldRow>

      <FieldRow>
        <Label htmlFor={`phone-${source}`}>{t.phone}</Label>
        <Input
          id={`phone-${source}`}
          name="phone"
          type="tel"
          placeholder="+66 ..."
          inputMode="tel"
          aria-invalid={!!fieldError("phone")}
          onChange={(e) => setHasPhone(e.target.value.trim().length > 0)}
        />
        <FieldError msg={fieldError("phone")} />
      </FieldRow>

      {showViewingDate ? (
        <FieldRow>
          <Label htmlFor={`viewingDate-${source}`}>{t.viewingDate}</Label>
          <Input
            id={`viewingDate-${source}`}
            name="viewingDate"
            type="date"
            min={todayIso}
          />
        </FieldRow>
      ) : null}

      {/* Reply channel — one tap tells us where to answer */}
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
        {needsPhone ? (
          <p className="text-xs text-brass-500">{t.replyChannelHint}</p>
        ) : null}
      </FieldRow>

      {/* Video tour — remote buyers' most common first ask */}
      {source === "object" ? (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-forest-500/85">
          <input
            type="checkbox"
            name="videoTour"
            value="yes"
            className="h-4 w-4 accent-forest-500"
          />
          {t.videoTour}
        </label>
      ) : null}

      <FieldRow>
        <Label htmlFor={`message-${source}`}>{t.message}</Label>
        <Textarea
          id={`message-${source}`}
          name="message"
          defaultValue={defaultMessage}
          rows={layout === "block" ? 5 : 4}
          aria-invalid={!!fieldError("message")}
        />
        <FieldError msg={fieldError("message")} />
      </FieldRow>

      {state.status === "ok" ? (
        <SuccessBlock
          message={state.message}
          lede={t.successLede}
          browseLabel={t.successBrowse}
          browseHref={listingsHref}
          waHref={whatsappLink(defaultMessage)}
          tgHref={telegramDmLink(rwNumber ? `interest_${rwNumber}` : undefined)}
        />
      ) : null}
      {state.status === "error" && state.message ? (
        <ErrorBanner message={state.message} />
      ) : null}

      <SubmitButton label={submitLabel ?? t.submit} sendingLabel={t.sending} />

      {/* Согласие на обработку данных: 11px на 50% прозрачности давало ~2.6:1
          при норме 4.5:1 — юридически значимый текст нельзя прятать. */}
      <p className="text-center text-xs text-forest-500/80">
        {t.privacyConsent}{" "}
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

function SubmitButton({ label, sendingLabel }: { label?: string; sendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" className="w-full" disabled={pending}>
      <Send className="h-4 w-4" />
      {/* key меняется вместе с надписью → короткая расфокусировка маскирует
          подмену текста (см. btnSwap в globals.css). */}
      <span key={pending ? "pending" : "idle"} className="motion-safe:animate-[btnSwap_220ms_ease-out]">
        {pending ? (sendingLabel ?? "Sending…") : (label ?? "Send enquiry")}
      </span>
    </Button>
  );
}

function SuccessBlock({
  message,
  lede,
  browseLabel,
  browseHref,
  waHref,
  tgHref,
}: {
  message: string;
  lede: string;
  browseLabel: string;
  browseHref: Route;
  waHref: string;
  tgHref: string;
}) {
  return (
    <div className="space-y-3 rounded-sm border border-forest-500/20 bg-forest-50/30 p-3 text-sm text-forest-500">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-forest-500" />
        <span>{message}</span>
      </div>
      {/* Keep the momentum: a DM-first audience often prefers to follow up in
          a messenger, and browsing more listings keeps the visit alive. */}
      <p className="text-xs text-forest-500/70">{lede}</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-forest-500/20 px-3 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:border-forest-500/40"
        >
          WhatsApp
        </a>
        <a
          href={tgHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-forest-500/20 px-3 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:border-forest-500/40"
        >
          Telegram
        </a>
        <Link
          href={browseHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-forest-500/20 px-3 py-1.5 text-xs font-medium text-forest-900 transition-colors hover:border-forest-500/40"
        >
          {browseLabel}
        </Link>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-sm border border-red-700/20 bg-red-50/40 p-3 text-sm text-red-900/80">
      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-700/70" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Traffic attribution for the lead, client-side only (server has no window).
 * Current URL utm_* wins; otherwise the stored first-touch record (captured by
 * <AttributionCapture/> on the landing page) — so a visitor who arrived from
 * an ad and submits the form pages later still carries the campaign. Returns
 * an empty object on first render to avoid hydration mismatch.
 */
function useUtmParams() {
  const [utm, setUtm] = useState<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    landing?: string;
  }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const stored = getAttribution();
    setUtm({
      utm_source: sp.get("utm_source") ?? stored?.source,
      utm_medium: sp.get("utm_medium") ?? stored?.medium,
      utm_campaign: sp.get("utm_campaign") ?? stored?.campaign,
      utm_content: sp.get("utm_content") ?? stored?.content,
      utm_term: sp.get("utm_term") ?? stored?.term,
      referrer: stored?.referrer,
      landing: stored?.landing,
    });
  }, []);

  return utm;
}
