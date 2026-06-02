import "server-only";

/**
 * Sends a Telegram notification to an admin chat when a new lead arrives.
 *
 * Env-gated: requires both TELEGRAM_NOTIFY_BOT_TOKEN and TELEGRAM_NOTIFY_CHAT_ID.
 * If either is missing, this is a no-op (returns silently). Useful in
 * development and previews where you don't want to spam the admin chat.
 *
 * Failure is non-throwing — a Telegram outage must not break form submission.
 *
 * Uses parse_mode="HTML" rather than Markdown — HTML escaping is unambiguous
 * (only <, >, & need it) and avoids the legacy Markdown parser's quirks
 * around brackets and parentheses in URLs.
 */
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
  const token = process.env.TELEGRAM_NOTIFY_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_NOTIFY_CHAT_ID;
  if (!token || !chatId) return;

  const amocrmDomain = process.env.AMOCRM_DOMAIN;
  const leadUrl =
    opts.leadId > 0 && amocrmDomain
      ? `https://${amocrmDomain}/leads/detail/${opts.leadId}`
      : null;

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
  if (leadUrl) {
    lines.push("");
    lines.push(`<a href="${esc(leadUrl)}">Open in amoCRM →</a>`);
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
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
