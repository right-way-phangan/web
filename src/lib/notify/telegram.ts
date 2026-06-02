import "server-only";

/**
 * Sends a Telegram notification to an admin chat when a new lead arrives.
 *
 * Env-gated: requires both TELEGRAM_NOTIFY_BOT_TOKEN and TELEGRAM_NOTIFY_CHAT_ID.
 * If either is missing, this is a no-op (returns silently). Useful in
 * development and previews where you don't want to spam the admin chat.
 *
 * Failure is non-throwing — a Telegram outage must not break form submission.
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
  lines.push(`🔔 *New website lead*`);
  lines.push("");
  lines.push(`*Name:* ${escapeMd(opts.contactName)}`);
  if (opts.email) lines.push(`*Email:* ${escapeMd(opts.email)}`);
  if (opts.phone) lines.push(`*Phone:* ${escapeMd(opts.phone)}`);
  if (opts.rwNumber) lines.push(`*About:* ${escapeMd(opts.rwNumber)}`);
  lines.push("");
  lines.push(`*Message:*`);
  lines.push(escapeMd(opts.message.slice(0, 600)));
  lines.push("");
  if (leadUrl) lines.push(`[Open in amoCRM](${leadUrl})`);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "Markdown",
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

/**
 * Minimal Markdown escape for Telegram parse_mode="Markdown" (legacy variant).
 * Only escapes the characters that have meaning at the top level — enough to
 * keep names and messages from breaking the markup.
 */
function escapeMd(text: string): string {
  return text.replace(/([_*[\]()`])/g, "\\$1");
}
