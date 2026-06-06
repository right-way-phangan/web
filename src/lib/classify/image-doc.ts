import "server-only";

/**
 * Content-based "is this image actually a document?" classifier.
 *
 * The publication rule (photos public, documents non-public) used to key off
 * the file *extension* — but the real leak is photos/scans of documents that
 * arrive as genuine image/jpeg: title-deed scans, cadastral maps, LandsMaps /
 * land-office screenshots, price spreadsheets, technical CAD plans. Those are
 * indistinguishable by MIME/extension, so we look at the pixels.
 *
 * Uses Claude vision when ANTHROPIC_API_KEY is set. When the key is absent (or
 * the call fails) we return `null` = "unknown" and the caller falls back to the
 * manual "это документ" toggle in the intake form.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
const API_URL = "https://api.anthropic.com/v1/messages";

const SUPPORTED_MEDIA = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const SYSTEM_PROMPT = `Ты классифицируешь изображения для каталога недвижимости.
Реши, ЧТО на изображении, и ответь РОВНО одним словом — DOCUMENT или PHOTO.

DOCUMENT — это всё, что является документом/служебным материалом, а не реальным
снимком объекта:
- сканы/фото бумажных документов на право собственности (чанот/Chanote, NS3/NS4,
  любые тайские деловые бумаги, реестровые ведомости с печатями);
- скриншоты карт и геосервисов (LandsMaps, Google Maps, кадастр, popup "Land
  Parcel Information", замеры/координаты поверх спутника);
- таблицы и расчёты (Excel/Google Sheets, прайс-листы, переписка в мессенджере);
- технические чертежи и планы (CAD floor plan, межевой/кадастровый план участка,
  чёрно-белые линейные схемы нарезки на участки).

PHOTO — реальный визуал объекта для показа покупателю:
- фотографии и аэро/дрон-съёмка земли, дома, виллы, вида, моря, интерьера;
- маркетинговые 3D-рендеры и цветные мастер-планы застройщика (off-plan).

Если фото объекта содержит лёгкую подпись/стрелку/площадь поверх — это всё ещё PHOTO.
Отвечай только DOCUMENT или PHOTO, без пояснений.`;

/**
 * @returns true = document, false = real photo, null = couldn't decide
 *          (no API key / unsupported type / API error) — caller decides default.
 */
export async function classifyImageIsDocument(
  bytes: ArrayBuffer | Uint8Array | Buffer,
  mediaType: string,
): Promise<boolean | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (!SUPPORTED_MEDIA.has(mediaType)) return null;

  const b64 = Buffer.from(bytes as Uint8Array).toString("base64");

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 5,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: b64 },
              },
              { type: "text", text: "DOCUMENT или PHOTO?" },
            ],
          },
        ],
      }),
    });
    if (!resp.ok) {
      console.error(`[classify] anthropic ${resp.status}`);
      return null;
    }
    const data = (await resp.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = (data.content ?? [])
      .map((c) => c.text ?? "")
      .join(" ")
      .toUpperCase();
    if (text.includes("DOCUMENT")) return true;
    if (text.includes("PHOTO")) return false;
    return null;
  } catch (err) {
    console.error("[classify] call failed:", err);
    return null;
  }
}
