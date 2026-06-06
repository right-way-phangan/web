"use server";

import { put } from "@vercel/blob";
import { createObjectCard, type NewObjectInput } from "@/lib/amocrm/object-writer";
import { AmoApiError } from "@/lib/amocrm/client";
import { notifyObjectCreated } from "@/lib/notify/telegram";
import { OBJECT_TYPES } from "@/lib/amocrm/dictionaries";

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

  // Collect all uploads from both inputs. Files dropped in the photos input
  // that are actually documents get auto-rerouted to DOCS (rule enforcement).
  const all = [...formData.getAll("photos"), ...formData.getAll("docs")]
    .filter((f): f is File => f instanceof File && f.size > 0 && f.size <= MAX_FILE_BYTES)
    .slice(0, MAX_FILES);

  const photoUrls: string[] = [];
  const docUrls: Array<{ name: string; url: string }> = [];
  try {
    for (const file of all) {
      if (isImage(file)) {
        photoUrls.push(await uploadBlob(file, "objects"));
      } else {
        docUrls.push({ name: file.name, url: await uploadBlob(file, "objects/docs") });
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
    description: str(formData.get("description")),
    photoUrls,
    docUrls,
  };

  try {
    const res = await createObjectCard(input);

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
      message: `Объект ${res.rwNumber} создан в amoCRM.`,
    };
  } catch (err) {
    if (err instanceof AmoApiError) {
      console.error("[new-object] amoCRM", err.status, err.body.slice(0, 300));
    } else {
      console.error("[new-object] unexpected:", err);
    }
    return {
      status: "error",
      message:
        "Не удалось создать карточку в amoCRM. Фото уже загружены — попробуйте опубликовать ещё раз.",
    };
  }
}
