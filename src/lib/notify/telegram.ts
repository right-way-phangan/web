import "server-only";

/**
 * Telegram admin notifications (bot @rightway_admin_notify_bot).
 *
 * Env-gated: requires both TELEGRAM_NOTIFY_BOT_TOKEN and TELEGRAM_NOTIFY_CHAT_ID.
 * If either is missing, sending is a no-op. Failure is non-throwing — a Telegram
 * outage must not break form submission.
 *
 * Links open our own admin app (CRM / objects) INSIDE Telegram via a web_app
 * inline button (Mini App), not amoCRM — we've migrated off amoCRM entirely and
 * the lead/object ids here are our own DB ids (amoCRM is only the dev fallback).
 * web_app buttons require an https URL and a private chat with the bot — both
 * hold for the admin notify chat. Non-https (localhost dev) falls back to a
 * plain url button.
 *
 * Uses parse_mode="HTML" — escaping is unambiguous (only <, >, & need it).
 */

/** Site origin for admin deep-links (rightwaygroup.co in prod). */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rightwaygroup.co").replace(/\/$/, "");

/** Phase B: leads/objects live in our own DB (amoCRM is the dev-only fallback). */
const OWN_CRM = Boolean(process.env.OBJECTS_API_URL);

type Button = { text: string; url: string };

export async function notifyLeadCreated(opts: {
  leadId: number;
  leadName: string;
  contactName: string;
  email?: string;
  phone?: string;
  message: string;
  pipelineId: number;
  rwNumber?: string;
}): Promise<void> {
  const lines: string[] = [];
  lines.push(`🔔 <b>New website lead</b>`);
  lines.push("");
  lines.push(`<b>Name:</b> ${esc(opts.contactName)}`);
  if (opts.email) lines.push(`<b>Email:</b> ${esc(opts.email)}`);
  if (opts.phone) lines.push(`<b>Phone:</b> ${esc(opts.phone)}`);
  if (opts.rwNumber) lines.push(`<b>About:</b> ${esc(opts.rwNumber)}`);
  lines.push("");
  lines.push(`<b>Message:</b>`);
  lines.push(esc(opts.message.slice(0, 600)));

  await send(lines, leadButton(opts.leadId));
}

/**
 * Heads-up when a new object card is created via the website admin form.
 * Same env-gating / non-throwing contract as notifyLeadCreated.
 */
export async function notifyObjectCreated(opts: {
  rwNumber: string;
  type: string;
  district?: string;
  elementUrl: string;
  photoCount: number;
}): Promise<void> {
  const lines: string[] = [];
  lines.push(`🏠 <b>New object added</b> — ${esc(opts.rwNumber)}`);
  lines.push("");
  lines.push(`<b>Type:</b> ${esc(opts.type)}`);
  if (opts.district) lines.push(`<b>District:</b> ${esc(opts.district)}`);
  lines.push(`<b>Photos:</b> ${opts.photoCount}`);
  lines.push(`<b>Source:</b> website /admin/new`);

  await send(lines, objectButton(opts.rwNumber, opts.elementUrl));
}

/** Lead deep-link: own CRM card in prod, amoCRM lead only as dev fallback. */
function leadButton(leadId: number): Button | null {
  if (OWN_CRM) {
    const url = leadId > 0 ? `${SITE_URL}/admin/crm/${leadId}` : `${SITE_URL}/admin/crm`;
    return { text: "📋 Открыть в CRM →", url };
  }
  const amocrmDomain = process.env.AMOCRM_DOMAIN;
  if (leadId > 0 && amocrmDomain) {
    return { text: "Open in amoCRM →", url: `https://${amocrmDomain}/leads/detail/${leadId}` };
  }
  return null;
}

/** Object deep-link: own admin object page in prod, amoCRM element as fallback. */
function objectButton(rwNumber: string, amoUrl: string): Button | null {
  if (OWN_CRM) {
    return { text: "🏠 Открыть объект →", url: `${SITE_URL}/admin/objects/${rwNumber}` };
  }
  return amoUrl ? { text: "Open in amoCRM →", url: amoUrl } : null;
}

/**
 * Send a message to the admin chat with an optional deep-link button.
 * https URLs → web_app (opens inside Telegram); otherwise a plain url button.
 */
async function send(lines: string[], button: Button | null): Promise<void> {
  const token = process.env.TELEGRAM_NOTIFY_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID;
  if (!token || !chatId) return;

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: lines.join("\n"),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (button) {
    const inner = button.url.startsWith("https://")
      ? { text: button.text, web_app: { url: button.url } }
      : { text: button.text, url: button.url };
    payload.reply_markup = { inline_keyboard: [[inner]] };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[notify-tg] ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    console.error("[notify-tg] send failed:", err);
  }
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
