"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/api/backend";
import { uploadImageToR2 } from "@/lib/storage/r2";

const API = process.env.OBJECTS_API_URL;
const MAX_FILES = 30;
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB each

export type AddPhotosResult = { ok: boolean; added: number; coverSet?: boolean; error?: string };

function isImage(file: File): boolean {
  // SVG может нести встроенный <script> → не публикуем как фото (XSS на blob-домене).
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return false;
  return file.type.startsWith("image/");
}

async function uploadBlob(file: File): Promise<string> {
  return uploadImageToR2(file, "objects");
}

/**
 * Upload images for an existing object and append them via the backend. Only
 * real images are accepted (site PHOTOS are image-only per the publication
 * rule); the first photo of a previously photo-less object becomes the cover,
 * which auto-republishes it on the site. Used by the /admin/objects uploader.
 */
export async function addObjectPhotosAction(formData: FormData): Promise<AddPhotosResult> {
  if (!API) return { ok: false, added: 0, error: "Backend не подключён." };
  const rwNumber = String(formData.get("rwNumber") ?? "").trim();
  if (!rwNumber) return { ok: false, added: 0, error: "Нет RW-номера." };

  const valid = (f: FormDataEntryValue): f is File =>
    f instanceof File && f.size > 0 && f.size <= MAX_FILE_BYTES;
  const files = formData.getAll("photos").filter(valid).slice(0, MAX_FILES);
  const images = files.filter(isImage);
  if (images.length === 0) {
    return { ok: false, added: 0, error: "Выберите изображения (image/*)." };
  }

  let urls: string[];
  try {
    urls = await Promise.all(images.map(uploadBlob));
  } catch (err) {
    console.error("[admin] photo blob upload failed:", err);
    return { ok: false, added: 0, error: "Не удалось загрузить файлы." };
  }

  try {
    const res = await backendFetch(`/objects/${encodeURIComponent(rwNumber)}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ urls }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, added: 0, error: `API ${res.status}: ${body.slice(0, 120)}` };
    }
    const data = (await res.json()) as { added?: number; coverSet?: boolean };
    revalidatePath("/admin/objects");
    revalidatePath("/admin");
    revalidatePath("/listings");
    revalidatePath(`/object/${rwNumber}`);
    return { ok: true, added: data.added ?? images.length, coverSet: data.coverSet };
  } catch (err) {
    console.error("[admin] addObjectPhotos failed:", err);
    return { ok: false, added: 0, error: "Сетевая ошибка при сохранении." };
  }
}
