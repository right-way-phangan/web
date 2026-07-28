import "server-only";
import { createHash, createHmac } from "node:crypto";

/**
 * Cloudflare R2 uploader (S3-compatible) — replaces the Vercel Blob `put()` used
 * by the object-intake server actions. The Vercel Blob store was suspended
 * (free-tier quota) and object photos moved to R2 (bucket `rw-objects`, served
 * from a public `pub-*.r2.dev` domain); new uploads must land in the same place.
 *
 * Dependency-free on purpose: signs the PUT with AWS Signature V4 using only
 * node:crypto, so no `@aws-sdk/*` is added to the web bundle. Server-only — it
 * holds the R2 secret access key and must never reach the client.
 *
 * Env (set on the Vercel `web` project, values mirror the migration script's
 * root .env):
 *   R2_ACCOUNT_ID  (or CLOUDFLARE_ACCOUNT_ID) · R2_BUCKET · R2_PUBLIC_BASE
 *   R2_ACCESS_KEY_ID · R2_SECRET_ACCESS_KEY
 */

interface R2Config {
  accountId: string;
  bucket: string;
  publicBase: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function r2Config(): R2Config {
  const cfg: R2Config = {
    accountId: process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || "",
    bucket: process.env.R2_BUCKET || "",
    publicBase: (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/, ""),
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  };
  const missing = Object.entries(cfg)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(`R2 not configured (missing: ${missing.join(", ")})`);
  }
  return cfg;
}

const sha256hex = (b: Uint8Array | string): string => createHash("sha256").update(b).digest("hex");
const hmac = (key: Buffer | string, data: string): Buffer =>
  createHmac("sha256", key).update(data).digest();

/** Encode each path segment (RFC 3986) while keeping the "/" separators. */
function encodeKey(key: string): string {
  return key.split("/").map((s) => encodeURIComponent(s)).join("/");
}

/**
 * PUT raw bytes to R2 under `key`, returning the public CDN URL
 * (`${R2_PUBLIC_BASE}/${key}`). Objects are immutable (unique key per upload),
 * so they are cached aggressively.
 */
export async function r2PutObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<string> {
  const cfg = r2Config();
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const canonicalUri = `/${cfg.bucket}/${encodeKey(key)}`;
  const payloadHash = sha256hex(body);

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256hex(canonicalRequest),
  ].join("\n");

  const kSigning = hmac(
    hmac(hmac(hmac("AWS4" + cfg.secretAccessKey, dateStamp), region), service),
    "aws4_request",
  );
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${canonicalUri}`, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    // body — Uint8Array; cast to BodyInit (TS 5.7/@types/node 22:
    // Uint8Array<ArrayBufferLike> не присваивается BodyInit напрямую).
    body: body as BodyInit,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`R2 PUT ${res.status}: ${txt.slice(0, 200)}`);
  }
  return `${cfg.publicBase}/${key}`;
}

/**
 * Upload a browser `File` (object photo) to R2 under `<folder>/<ts>-<rand>-<name>`.
 * Mirrors the old `put(..., { addRandomSuffix: true })` key shape so paths stay
 * collision-free. Returns the public URL stored on the object.
 */
export async function uploadImageToR2(file: File, folder = "objects"): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const rand = Math.random().toString(36).slice(2, 10);
  const raw = new Uint8Array(await file.arrayBuffer());
  const { body, contentType, ext } = await compressForWeb(raw, file.type);
  const name = ext ? safeName.replace(/\.[^.]+$/, "") + ext : safeName;
  const key = `${folder}/${Date.now()}-${rand}-${name}`;
  return r2PutObject(key, body, contentType);
}

/** Длинная сторона фото каталога — тот же предел, что задала миграция на R2. */
const MAX_IMAGE_SIDE = 2000;

/**
 * Приводит загружаемое фото к весу каталога (≤2000px, JPEG q85).
 *
 * Раньше файл летел в R2 как есть, и снимки прямо с камеры оседали там по
 * 5–10 МБ: страница проекта The Sands тянула 37.6 МБ картинок, Lighthouse
 * показывал LCP 90 с. Пережимать на заливке дешевле, чем ловить это потом —
 * оптимизатор Vercel нам недоступен (`images.unoptimized`, квота Hobby).
 *
 * `rotate()` без аргументов применяет EXIF-ориентацию: телефоны пишут её в
 * метаданные, а после ресайза она теряется — без этого портретные фото легли бы
 * на бок. SVG и GIF не трогаем (векторы и анимация), при сбое — заливаем оригинал.
 */
async function compressForWeb(
  raw: Uint8Array,
  mime: string,
): Promise<{ body: Uint8Array; contentType: string; ext: string | null }> {
  const asIs = { body: raw, contentType: mime || "image/jpeg", ext: null };
  if (!mime.startsWith("image/") || mime === "image/svg+xml" || mime === "image/gif") return asIs;

  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(raw)
      .rotate()
      .resize({ width: MAX_IMAGE_SIDE, height: MAX_IMAGE_SIDE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toBuffer();
    // Крохотные PNG-иконки/схемы JPEG может раздуть — тогда оставляем оригинал.
    if (out.byteLength >= raw.byteLength) return asIs;
    return { body: new Uint8Array(out), contentType: "image/jpeg", ext: ".jpg" };
  } catch {
    return asIs;
  }
}
