"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { track } from "@vercel/analytics";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitInquiry, type FormState } from "@/lib/actions/inquiry";
import { getFormDict, type Locale } from "@/lib/i18n/dictionaries";
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
  /** "calculator" tags the lead as coming from the ROI calculator; "market-report" from /insights; "shortlist" from /saved; "saved-search" = a new-listing alert request. */
  kind?: "inquiry" | "calculator" | "market-report" | "shortlist" | "saved-search";
  /** Submit button label override. */
  submitLabel?: string;
  /** Show an optional "preferred viewing date" field (object pages). */
  showViewingDate?: boolean;
  /** Fired once after a successful submission — e.g. to unlock gated content. */
  onSuccess?: () => void;
  /** UI language for field labels/buttons. Server still stores the lead the same way. */
  locale?: Locale;
}

const FIELDS = ["name", "email", "phone", "message"] as const;
type FieldKey = (typeof FIELDS)[number];

export function LeadForm({ rwNumber, source, defaultMessage, layout = "card", kind, submitLabel, showViewingDate, onSuccess, locale = "en" }: Props) {
  const t = getFormDict(locale);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [state, formAction] = useActionState(submitInquiry, initialState);
  const utm = useUtmParams();
  const formRef = useRef<HTMLFormElement | null>(null);

  // Reset form on success + emit analytics event
  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
      track("inquiry_submitted", {
        source,
        rwNumber: rwNumber ?? "n/a",
        kind: kind ?? "inquiry",
      });
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
      className={cn(layout === "card" ? "space-y-4" : "space-y-5")}
      aria-label={rwNumber ? `Enquiry about ${rwNumber}` : "Contact form"}
    >
      {/* Hidden context */}
      <input type="hidden" name="source" value={source} />
      {kind ? <input type="hidden" name="kind" value={kind} /> : null}
      {rwNumber ? <input type="hidden" name="rwNumber" value={rwNumber} /> : null}
      {utm.utm_source ? <input type="hidden" name="utm_source" value={utm.utm_source} /> : null}
      {utm.utm_medium ? <input type="hidden" name="utm_medium" value={utm.utm_medium} /> : null}
      {utm.utm_campaign ? <input type="hidden" name="utm_campaign" value={utm.utm_campaign} /> : null}
      {utm.utm_content ? <input type="hidden" name="utm_content" value={utm.utm_content} /> : null}

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

      {state.status === "ok" ? <SuccessBanner message={state.message} /> : null}
      {state.status === "error" && state.message ? (
        <ErrorBanner message={state.message} />
      ) : null}

      <SubmitButton label={submitLabel ?? t.submit} sendingLabel={t.sending} />

      <p className="text-center text-[11px] text-forest-500/50">{t.privacy}</p>
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
      {pending ? (sendingLabel ?? "Sending…") : (label ?? "Send enquiry")}
    </Button>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-sm border border-forest-500/20 bg-forest-50/30 p-3 text-sm text-forest-500">
      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-forest-500" />
      <span>{message}</span>
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
 * UTM capture from the current URL, performed client-side only (server has no
 * window). Returns empty object on first render to avoid hydration mismatch.
 */
function useUtmParams() {
  const [utm, setUtm] = useState<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
  }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setUtm({
      utm_source: sp.get("utm_source") ?? undefined,
      utm_medium: sp.get("utm_medium") ?? undefined,
      utm_campaign: sp.get("utm_campaign") ?? undefined,
      utm_content: sp.get("utm_content") ?? undefined,
    });
  }, []);

  return utm;
}
