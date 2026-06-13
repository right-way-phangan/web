"use server";

import { put } from "@vercel/blob";
import { createObjectCard, ObjectInputError, type NewObjectInput } from "@/lib/amocrm/object-writer";
import { AmoApiError } from "@/lib/amocrm/client";
import { notifyObjectCreated } from "@/lib/notify/telegram";
import { OBJECT_TYPES } from "@/lib/amocrm/dictionaries";
import { classifyImageIsDocument } from "@/lib/classify/image-doc";
import { backendFetch } from "@/lib/api/backend";

/**
 * Migration off amoCRM (Phase A): when OBJECTS_API_URL is set, new objects are
 * written to the own DB via the backend API instead of the amoCRM catalog.
 * Unset → amoCRM (current prod behavior, untouched).
 */
const OBJECTS_API_URL = process.env.OBJECTS_API_URL;

async function createViaApi(
  input: NewObjectInput,
): Promise<{ rwNumber: string; url: string }> {
  const res = await backendFetch(`/objects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    rwNumber?: string;
    url?: string;
    error?: string;
  };
  if (res.status === 400 && body.error) throw new ObjectInputError(body.error);
  if (!res.ok || !body.rwNumber) {
    throw new Error(`objects API POST → ${res.status}: ${body.error ?? "no rwNumber"}`);
  }
  return { rwNumber: body.rwNumber, url: body.url ?? `/object/${body.rwNumber}` };
}

export type NewObjectState =
  | { status: "idle" }
  | {
      status: "ok";
      rwNumber: string;
      url: string;
      photoCount: number;
      docCount: number;
      message: string;
    }
  | { status: "error"; message: string };

/** Parse a loose numeric string ("8 175 000", "8.175M", "4500000") → int. */
function toInt(raw: string | null): number | undefined {
  if (!raw) return undefined;
  let s = raw.trim().replace(/[\s, ]/g, "");
  if (!s) return undefined;
  let mult = 1;
  if (/k$/i.test(s)) {
    mult = 1_000;
    s = s.slice(0, -1);
  } else if (/m$/i.test(s)) {
    mult = 1_000_000;
    s = s.slice(0, -1);
  }
  const n = Number(s) * mult;
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

/** Parse a decimal string ("7.9", "15") → number (keeps fractions). */
function toFloat(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function str(raw: FormDataEntryValue | null): string | undefined {
  const v = typeof raw === "string" ? raw.trim() : "";
  return v || undefined;
}

const MAX_FILES = 30;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB each

/**
 * Publication rule: only real images become public PHOTOS. Everything else
 * (PDF, office docs, CAD, archives — i.e. documents / working files) is kept
 * as non-public DOCS, accessible from the CRM card but never shown on the
 * site. We classify by MIME first, with an extension fallback for browsers
 * that send an empty type.
 */
const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|csv|txt|rtf|dwg|dxf|zip|rar|7z|kml|kmz|gpx)$/i;
function isImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (file.type) return false; // a non-image MIME was declared → treat as doc
  return !DOC_EXT.test(file.name); // no MIME: doc only if it looks like one
}

/**
 * Traced plot contour from the map editor (hidden input, JSON). Client sends
 * [[lat, lng], …]; backend re-validates (Phangan bbox, ≥3 vertices) — here we
 * only guard against malformed JSON so a broken value never blocks intake.
 */
function parsePlotPolygon(raw?: string): Array<[number, number]> | undefined {
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 3) return undefined;
    const pts = parsed.filter(
      (p): p is [number, number] =>
        Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]),
    );
    return pts.length >= 3 ? pts : undefined;
  } catch {
    return undefined;
  }
}

async function uploadBlob(file: File, folder: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function createObject(
  _prev: NewObjectState,
  formData: FormData,
): Promise<NewObjectState> {
  const type = str(formData.get("type"));
  if (!type || !(OBJECT_TYPES as readonly string[]).includes(type)) {
    return { status: "error", message: "Выберите корректный тип объекта." };
  }

  const valid = (f: FormDataEntryValue): f is File =>
    f instanceof File && f.size > 0 && f.size <= MAX_FILE_BYTES;
  // The photos input order matches the indices the form marked as documents.
  const photoFiles = formData.getAll("photos").filter(valid).slice(0, MAX_FILES);
  const docFiles = formData.getAll("docs").filter(valid).slice(0, MAX_FILES);
  // Manual override from the form: indices (in photo order) the user tagged as
  // "это документ". Takes precedence over the vision classifier.
  const manualDocIdx = new Set(
    (str(formData.get("photoDocFlags")) ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n)),
  );

  const photoUrls: string[] = [];
  const docUrls: Array<{ name: string; url: string }> = [];
  try {
    // Files explicitly added to the docs input are always documents.
    for (const file of docFiles) {
      docUrls.push({ name: file.name, url: await uploadBlob(file, "objects/docs") });
    }
    // Photos: route each to DOCS if the user flagged it, if it isn't an image,
    // or if the vision classifier recognises a document-scan/map/sheet/plan.
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      let isDoc = manualDocIdx.has(i) || !isImage(file);
      if (!isDoc) {
        const verdict = await classifyImageIsDocument(
          await file.arrayBuffer(),
          file.type || "image/jpeg",
        );
        isDoc = verdict === true; // null (unknown) → keep as photo, toggle is the net
      }
      if (isDoc) {
        docUrls.push({ name: file.name, url: await uploadBlob(file, "objects/docs") });
      } else {
        photoUrls.push(await uploadBlob(file, "objects"));
      }
    }
  } catch (err) {
    console.error("[new-object] blob upload failed:", err);
    return {
      status: "error",
      message: "Не удалось загрузить файлы. Проверьте их и попробуйте ещё раз.",
    };
  }

  const input: NewObjectInput = {
    type,
    district: str(formData.get("district")),
    documentType: str(formData.get("documentType")),
    tenure: formData.getAll("tenure").filter((v): v is string => typeof v === "string"),
    area: str(formData.get("area")),
    pricePerRai: toInt(formData.get("pricePerRai") as string | null),
    rentPerRaiMonth: toInt(formData.get("rentPerRaiMonth") as string | null),
    leasePrepayment: toInt(formData.get("leasePrepayment") as string | null),
    leaseTermYears: toInt(formData.get("leaseTermYears") as string | null),
    leaseEscalation: str(formData.get("leaseEscalation")),
    leaseAddTerms: str(formData.get("leaseAddTerms")),
    buildingRules: str(formData.get("buildingRules")),
    priceThb: toInt(formData.get("priceThb") as string | null),
    owner: str(formData.get("owner")),
    commission: str(formData.get("commission")),
    locationUrl: str(formData.get("locationUrl")),
    plotPolygon: parsePlotPolygon(str(formData.get("plotPolygon"))),
    zone: str(formData.get("zone")),
    roadType: str(formData.get("roadType")),
    waterType: str(formData.get("waterType")),
    internetType: str(formData.get("internetType")),
    terrain: str(formData.get("terrain")),
    features: formData.getAll("features").filter((v): v is string => typeof v === "string"),
    bedrooms: toInt(formData.get("bedrooms") as string | null),
    bathrooms: toInt(formData.get("bathrooms") as string | null),
    buildYear: toInt(formData.get("buildYear") as string | null),
    condition: str(formData.get("condition")),
    villaFeatures: formData
      .getAll("villaFeatures")
      .filter((v): v is string => typeof v === "string"),
    stage: str(formData.get("stage")),
    developer: str(formData.get("developer")),
    completion: str(formData.get("completion")),
    paymentTerms: str(formData.get("paymentTerms")),
    furnishing: str(formData.get("furnishing")),
    netYieldPct: toFloat(formData.get("netYieldPct") as string | null),
    estNetIncomeYear: toInt(formData.get("estNetIncomeYear") as string | null),
    unitsTotal: toInt(formData.get("unitsTotal") as string | null),
    unitsAvailable: toInt(formData.get("unitsAvailable") as string | null),
    videoUrls: str(formData.get("videoUrls")),
    floorplanUrls: str(formData.get("floorplanUrls")),
    priceStages: str(formData.get("priceStages")),
    timeline: str(formData.get("timeline")),
    team: str(formData.get("team")),
    description: str(formData.get("description")),
    title: str(formData.get("title")),
    parentProjectRw: str(formData.get("parentProjectRw")),
    status: str(formData.get("status")),
    photoUrls,
    docUrls,
  };

  const target = OBJECTS_API_URL ? "базе" : "amoCRM";
  try {
    const res = OBJECTS_API_URL
      ? await createViaApi(input)
      : await createObjectCard(input);

    await notifyObjectCreated({
      rwNumber: res.rwNumber,
      type: input.type,
      district: input.district,
      elementUrl: res.url,
      photoCount: photoUrls.length,
    });

    return {
      status: "ok",
      rwNumber: res.rwNumber,
      url: res.url,
      photoCount: photoUrls.length,
      docCount: docUrls.length,
      message: `Объект ${res.rwNumber} создан в ${target}.`,
    };
  } catch (err) {
    // Validation errors (e.g. unknown parent project) carry a user-facing
    // message — surface it verbatim instead of the generic failure text.
    if (err instanceof ObjectInputError) {
      return { status: "error", message: err.message };
    }
    if (err instanceof AmoApiError) {
      console.error("[new-object] amoCRM", err.status, err.body.slice(0, 300));
    } else {
      console.error("[new-object] unexpected:", err);
    }
    return {
      status: "error",
      message: `Не удалось создать карточку в ${target}. Фото уже загружены — попробуйте опубликовать ещё раз.`,
    };
  }
}
