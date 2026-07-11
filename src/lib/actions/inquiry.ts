"use server";

import { z } from "zod";
import { createLead, AmoApiError } from "@/lib/amocrm/client";
import { amoEnv } from "@/lib/amocrm/env";
import { backendFetch } from "@/lib/api/backend";
import { getObjectByRwNumber } from "@/lib/data/objects";
import { notifyLeadCreated } from "@/lib/notify/telegram";
import { rateLimit } from "@/lib/ratelimit";
import type { ObjectType } from "@/types/object";

export type FormState =
  | { status: "idle" }
  | { status: "ok"; leadId: number; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

const inquirySchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name."),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email.")
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    message: z.string().trim().min(5, "Please write a short message."),
    viewingDate: z.string().trim().optional(), // ISO date when booking a viewing
    replyVia: z.enum(["whatsapp", "telegram", "email"]).optional(), // preferred reply channel
    videoTour: z.literal("yes").optional(), // checkbox: send a video tour

    // Hidden / context fields
    rwNumber: z.string().optional(),       // present on object inquiry, absent on /contact
    vid: z.string().max(64).optional(),    // anonymous visitor id → links lead to its browse journey
    source: z.enum(["object", "contact"]), // discriminator
    lang: z.enum(["en", "ru"]).optional(), // UI language the visitor submitted in → reply in their language
    kind: z.enum(["inquiry", "calculator", "market-report", "shortlist", "saved-search", "valuation", "construction"]).optional(), // calculator = ROI-calc; market-report = /insights unlock; shortlist = saved-listings batch; saved-search = new-listing alert request; valuation = /tools/estimate seller lead; construction = developer-page build request
    developer: z.string().max(80).optional(), // developer lead tag (developer-page construction requests)
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
    utm_term: z.string().max(200).optional(),
    referrer: z.string().max(200).optional(),   // external referrer hostname (first touch)
    landing: z.string().max(300).optional(),    // landing path+query (first touch)
    // Honeypot — must remain empty
    website: z.string().max(0).optional(),
  })
  .refine((v) => Boolean(v.email) || Boolean(v.phone), {
    message: "Please provide an email or a phone number so we can reply.",
    path: ["email"],
  });

/**
 * Choose CRM pipeline based on the property type the inquiry is about.
 * /contact (no object) defaults to Land pipeline + a website-contact tag.
 */
function pipelineFor(type: ObjectType | undefined): number {
  if (type === "Villa" || type === "House" || type === "Apartment" || type === "Project") {
    return amoEnv.AMOCRM_PIPELINE_VILLA_HOUSE;
  }
  return amoEnv.AMOCRM_PIPELINE_LAND;
}

/**
 * Migration off amoCRM (Phase B): when OBJECTS_API_URL is set, leads are created
 * in the own CRM via the backend API instead of amoCRM /leads/complex. Unset →
 * amoCRM (current prod behavior). The own-CRM pipeline is keyed, not id'd.
 */
const CRM_API_URL = process.env.OBJECTS_API_URL;

function pipelineKeyFor(
  type: ObjectType | undefined,
  isSeller: boolean,
): "land" | "villa_house" | "owners" {
  // /sell (valuation) — a property owner offering their object, not a buyer.
  if (isSeller) return "owners";
  if (type === "Villa" || type === "House" || type === "Apartment" || type === "Project") {
    return "villa_house";
  }
  return "land";
}

function utmTags(input: z.infer<typeof inquirySchema>): string[] {
  const tags: string[] = [];
  if (input.utm_source) tags.push(`utm-source:${input.utm_source}`);
  if (input.utm_medium) tags.push(`utm-medium:${input.utm_medium}`);
  if (input.utm_campaign) tags.push(`utm-campaign:${input.utm_campaign}`);
  if (input.utm_content) tags.push(`utm-content:${input.utm_content}`);
  if (input.utm_term) tags.push(`utm-term:${input.utm_term}`);
  if (!input.utm_source && input.referrer) tags.push(`ref:${input.referrer}`);
  return tags;
}

/** One human-readable "where the visitor came from" line for the lead note. */
function trafficLine(input: z.infer<typeof inquirySchema>): string | null {
  const channel = [input.utm_source, input.utm_medium, input.utm_campaign]
    .filter(Boolean)
    .join(" / ");
  const parts = [
    channel || null,
    !channel && input.referrer ? `ref: ${input.referrer}` : null,
    input.landing ? `landed: ${input.landing}` : null,
  ].filter(Boolean);
  return parts.length ? `Traffic: ${parts.join(" · ")}` : null;
}

export async function submitInquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // FormData → plain object
  const raw: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      status: "error",
      message: "Please check the form and try again.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  // Silent bot rejection (honeypot tripped → looks like success to bots,
  // but no CRM hit).
  if (data.website && data.website.length > 0) {
    return {
      status: "ok",
      leadId: 0,
      message: "Thanks — we'll be in touch.",
    };
  }

  // Per-IP throttle (8 / hour) so the form can't be used to flood the CRM with
  // lead spam past the honeypot. Fail-open if the backend is unreachable.
  if (!(await rateLimit("inquiry", 8, 60 * 60))) {
    return {
      status: "error",
      message: "Too many requests. Please try again in a little while.",
    };
  }

  // Resolve target pipeline + tags
  let objectTitle: string | undefined;
  let objectType: ObjectType | undefined;
  if (data.rwNumber) {
    const obj = await getObjectByRwNumber(data.rwNumber);
    if (obj) {
      objectTitle = obj.titleEn;
      objectType = obj.type;
    }
  }

  const isCalc = data.kind === "calculator";
  const isMarketReport = data.kind === "market-report";
  const isShortlist = data.kind === "shortlist";
  const isSavedSearch = data.kind === "saved-search";
  const isValuation = data.kind === "valuation";
  const isConstruction = data.kind === "construction";
  // Construction requests carry no rwNumber → route to the villas pipeline
  // (one decision point for both the own-CRM and amoCRM branches below).
  const pipelineType: ObjectType | undefined = isConstruction ? "Villa" : objectType;
  const isViewing = Boolean(data.viewingDate);
  const wantsVideoTour = data.videoTour === "yes";
  const tags = [
    "website",
    data.source === "contact" ? "website-contact" : "website-inquiry",
    ...(isCalc ? ["calculator"] : []),
    ...(isMarketReport ? ["market-report"] : []),
    ...(isShortlist ? ["shortlist"] : []),
    ...(isSavedSearch ? ["saved-search"] : []),
    ...(isValuation ? ["valuation", "seller-lead"] : []),
    ...(isConstruction ? ["construction"] : []),
    ...(data.developer ? [`developer:${data.developer}`] : []),
    ...(isViewing ? ["viewing"] : []),
    ...(wantsVideoTour ? ["video-tour"] : []),
    ...(data.replyVia ? [`reply:${data.replyVia}`] : []),
    ...(data.lang ? [`lang:${data.lang}`] : []),
    ...(data.rwNumber ? [`object:${data.rwNumber}`] : []),
    ...utmTags(data),
  ];

  // Fold the extras into the message that becomes the lead note and the
  // Telegram ping, so the agent sees them without opening custom fields.
  const extras = [
    data.lang === "ru" ? "🗣️ Submitted on the RU site — reply in Russian" : null,
    isViewing ? `Preferred viewing date: ${data.viewingDate}` : null,
    wantsVideoTour ? "🎥 Video tour requested" : null,
    data.replyVia ? `Reply via: ${data.replyVia}` : null,
    trafficLine(data),
  ].filter(Boolean);
  const noteMessage = extras.length
    ? `${data.message}\n\n${extras.join("\n")}`
    : data.message;

  // Build amoCRM payload — leads/complex creates lead + contact in one call.
  const namePrefix = isViewing
    ? "Viewing request"
    : isConstruction
      ? "Construction request"
      : isValuation
        ? "Valuation · seller"
        : isMarketReport
          ? "Market report"
          : isShortlist
            ? "Shortlist"
            : isSavedSearch
              ? "New-listing alert"
              : isCalc
                ? "Calc lead"
                : data.rwNumber
                  ? "Web inquiry"
                : "Web contact";
  const leadName = data.rwNumber
    ? `${namePrefix} · ${data.rwNumber}${objectTitle ? ` · ${objectTitle.slice(0, 60)}` : ""}`
    : `${namePrefix} · ${data.name}`;

  const contactCustomFields: Array<{
    field_code: "PHONE" | "EMAIL";
    values: Array<{ value: string; enum_code?: string }>;
  }> = [];
  if (data.email) {
    contactCustomFields.push({
      field_code: "EMAIL",
      values: [{ value: data.email, enum_code: "WORK" }],
    });
  }
  if (data.phone) {
    contactCustomFields.push({
      field_code: "PHONE",
      values: [{ value: data.phone, enum_code: "WORK" }],
    });
  }

  try {
    let leadId: number;

    if (CRM_API_URL) {
      // Own CRM (Phase B): create lead+contact+note in our DB.
      const res = await backendFetch(`/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          leadName,
          pipeline: pipelineKeyFor(pipelineType, isValuation),
          contact: {
            name: data.name,
            email: data.email || undefined,
            phone: data.phone || undefined,
          },
          note: noteMessage,
          tags,
          rwNumber: data.rwNumber || undefined,
          source: data.source,
          kind: data.kind,
          vid: data.vid || undefined,
        }),
      });
      if (!res.ok) throw new Error(`leads API → ${res.status}`);
      const body = (await res.json()) as { leadId?: number };
      leadId = body.leadId ?? 0;
    } else {
      const pipelineId = pipelineFor(pipelineType);
      const res = await createLead({
        name: leadName,
        pipeline_id: pipelineId,
        _embedded: {
          contacts: [{ first_name: data.name, custom_fields_values: contactCustomFields }],
          tags: tags.map((name) => ({ name })),
        },
      });
      leadId = res[0]?.id ?? 0;
      // Descriptive message → lead's first note (best-effort; don't fail the form).
      if (leadId > 0) {
        try {
          await postLeadNote(leadId, noteMessage);
        } catch (err) {
          console.error("[inquiry] note attach failed:", err);
        }
      }
    }

    // Telegram heads-up. Non-blocking — failures are logged, not surfaced.
    await notifyLeadCreated({
      leadId,
      leadName,
      contactName: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      message: noteMessage,
      pipelineId: 0,
      rwNumber: data.rwNumber || undefined,
    });

    return {
      status: "ok",
      leadId,
      message: data.rwNumber
        ? `Thanks — we'll reply about ${data.rwNumber} within the working day.`
        : "Thanks — we'll reply within the working day.",
    };
  } catch (err) {
    if (err instanceof AmoApiError) {
      console.error("[inquiry] amoCRM error", err.status, err.body.slice(0, 300));
    } else {
      console.error("[inquiry] unexpected:", err);
    }
    return {
      status: "error",
      message:
        "Something went wrong on our side. Please message us on Telegram or WhatsApp instead — we'll fix this shortly.",
    };
  }
}

/**
 * Attach the visitor's message as a note on the lead.
 * Uses the lower-level fetch since we don't have a wrapper helper for notes.
 */
async function postLeadNote(leadId: number, text: string): Promise<void> {
  const url = `https://${amoEnv.AMOCRM_DOMAIN}/api/v4/leads/${leadId}/notes`;
  const body = [
    {
      entity_id: leadId,
      note_type: "common" as const,
      params: { text },
    },
  ];
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${amoEnv.AMOCRM_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`note POST ${res.status}: ${t.slice(0, 200)}`);
  }
}
