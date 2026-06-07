"use server";

import { z } from "zod";
import { createLead, AmoApiError } from "@/lib/amocrm/client";
import { amoEnv } from "@/lib/amocrm/env";
import { getObjectByRwNumber } from "@/lib/data/objects";
import { notifyLeadCreated } from "@/lib/notify/telegram";
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

    // Hidden / context fields
    rwNumber: z.string().optional(),       // present on object inquiry, absent on /contact
    source: z.enum(["object", "contact"]), // discriminator
    kind: z.enum(["inquiry", "calculator", "market-report", "shortlist"]).optional(), // calculator = ROI-calc; market-report = /insights unlock; shortlist = saved-listings batch
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_content: z.string().optional(),
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

function utmTags(input: z.infer<typeof inquirySchema>): string[] {
  const tags: string[] = [];
  if (input.utm_source) tags.push(`utm-source:${input.utm_source}`);
  if (input.utm_medium) tags.push(`utm-medium:${input.utm_medium}`);
  if (input.utm_campaign) tags.push(`utm-campaign:${input.utm_campaign}`);
  if (input.utm_content) tags.push(`utm-content:${input.utm_content}`);
  return tags;
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

  const pipelineId = pipelineFor(objectType);
  const isCalc = data.kind === "calculator";
  const isMarketReport = data.kind === "market-report";
  const isShortlist = data.kind === "shortlist";
  const tags = [
    "website",
    data.source === "contact" ? "website-contact" : "website-inquiry",
    ...(isCalc ? ["calculator"] : []),
    ...(isMarketReport ? ["market-report"] : []),
    ...(isShortlist ? ["shortlist"] : []),
    ...(data.rwNumber ? [`object:${data.rwNumber}`] : []),
    ...utmTags(data),
  ];

  // Build amoCRM payload — leads/complex creates lead + contact in one call.
  const namePrefix = isMarketReport
    ? "Market report"
    : isShortlist
      ? "Shortlist"
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
    const res = await createLead({
      name: leadName,
      pipeline_id: pipelineId,
      _embedded: {
        contacts: [
          {
            first_name: data.name,
            custom_fields_values: contactCustomFields,
          },
        ],
        tags: tags.map((name) => ({ name })),
      },
    });
    const leadId = res[0]?.id ?? 0;

    // Note: descriptive message goes into the lead's first note via a
    // separate API call. For MVP we encode it into the lead name's tail
    // would lose detail — better to add as note. POST /api/v4/leads/{id}/notes
    // We do best-effort and don't fail the form if note fails.
    if (leadId > 0) {
      try {
        await postLeadNote(leadId, data.message);
      } catch (err) {
        console.error("[inquiry] note attach failed:", err);
      }
    }

    // Telegram heads-up. Non-blocking — failures are logged, not surfaced.
    await notifyLeadCreated({
      leadId,
      leadName,
      contactName: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      message: data.message,
      pipelineId,
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
