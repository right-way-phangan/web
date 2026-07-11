"use server";

import { z } from "zod";
import { backendFetch } from "@/lib/api/backend";
import { notifyLeadCreated } from "@/lib/notify/telegram";
import { rateLimit } from "@/lib/ratelimit";
import { PROPERTY_TYPES, TENURES, composeSellerLead } from "@/lib/crm/seller-lead";

export type SellerFormState =
  | { status: "idle" }
  | { status: "ok"; leadId: number; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

/** Empty <select>/<input> values arrive as "" — treat those as "not provided". */
const emptyToUndef = (v: unknown) => (v === "" ? undefined : v);

const sellerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name."),
    email: z.string().trim().email("Please enter a valid email.").optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    propertyType: z.enum(PROPERTY_TYPES),
    location: z.string().trim().min(2, "Please tell us where the property is."),
    size: z.string().trim().max(120).optional(),
    tenure: z.preprocess(emptyToUndef, z.enum(TENURES).optional()),
    price: z.string().trim().max(120).optional(),
    hasDocs: z.literal("yes").optional(),
    message: z.string().trim().max(4000).optional(),
    replyVia: z.preprocess(emptyToUndef, z.enum(["whatsapp", "telegram", "email"]).optional()),

    // Hidden context
    vid: z.string().max(64).optional(),
    lang: z.preprocess(emptyToUndef, z.enum(["en", "ru"]).optional()),
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    landing: z.string().max(300).optional(),
    // Honeypot — must remain empty
    website: z.string().max(0).optional(),
  })
  .refine((v) => Boolean(v.email) || Boolean(v.phone), {
    message: "Please leave a phone or email so we can reply.",
    path: ["phone"],
  });

/**
 * Property-submission form (owner offering a property for sale). Always lands
 * in the own-CRM "owners" pipeline — never amoCRM, which we no longer write to.
 */
export async function submitSellerListing(
  _prev: SellerFormState,
  formData: FormData,
): Promise<SellerFormState> {
  const raw: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string") raw[k] = v;

  const parsed = sellerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { status: "error", message: "Please check the form and try again.", fieldErrors };
  }
  const data = parsed.data;

  // Honeypot tripped → look like success to the bot, write nothing.
  if (data.website && data.website.length > 0) {
    return { status: "ok", leadId: 0, message: "Thanks — we'll be in touch." };
  }

  // Per-IP throttle so the form can't flood the CRM (fail-open if backend down).
  if (!(await rateLimit("seller-listing", 6, 60 * 60))) {
    return { status: "error", message: "Too many requests. Please try again in a little while." };
  }

  const { leadName, note, tags } = composeSellerLead({
    name: data.name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    propertyType: data.propertyType,
    location: data.location,
    size: data.size || undefined,
    tenure: data.tenure,
    price: data.price || undefined,
    hasDocs: data.hasDocs === "yes",
    message: data.message || undefined,
    replyVia: data.replyVia,
    lang: data.lang,
    utmSource: data.utm_source,
    utmMedium: data.utm_medium,
    utmCampaign: data.utm_campaign,
    landing: data.landing,
  });

  try {
    const res = await backendFetch("/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        leadName,
        pipeline: "owners",
        contact: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
        },
        note,
        tags,
        source: "contact",
        kind: "seller-listing",
        vid: data.vid || undefined,
      }),
    });
    if (!res.ok) throw new Error(`leads API → ${res.status}`);
    const body = (await res.json()) as { leadId?: number };
    const leadId = body.leadId ?? 0;

    // Telegram heads-up — non-blocking.
    await notifyLeadCreated({
      leadId,
      leadName,
      contactName: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      message: note,
      pipelineId: 0,
    });

    return {
      status: "ok",
      leadId,
      message: "Thanks — we'll review your property and reply within the working day.",
    };
  } catch (err) {
    console.error("[seller-listing] failed:", err);
    return {
      status: "error",
      message:
        "Something went wrong on our side. Please message us on Telegram or WhatsApp instead — we'll fix this shortly.",
    };
  }
}
