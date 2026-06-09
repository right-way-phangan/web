import "server-only";
import { amoEnv } from "./env";
import type {
  AmoCatalogElement,
  AmoCatalogListResponse,
  AmoCatalogCustomField,
  AmoCustomFieldsResponse,
  AmoCatalogElementCreateInput,
  AmoLeadCreateInput,
} from "./types";

class AmoApiError extends Error {
  constructor(public status: number, public body: string, message: string) {
    super(message);
  }
}

type FetchInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

async function request<T>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: unknown,
  init?: FetchInit,
): Promise<T> {
  const url = `https://${amoEnv.AMOCRM_DOMAIN}/api/v4${path}`;
  // GETs are cached by Next.js for 5min by default; writes are always uncached.
  const defaultNext =
    method === "GET" ? { next: { revalidate: 300 } as const } : { cache: "no-store" as const };
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${amoEnv.AMOCRM_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    ...defaultNext,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AmoApiError(res.status, text, `amoCRM ${method} ${path} → ${res.status}`);
  }
  // 204 no content for some PATCH calls
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * List catalog elements (paginated). Defaults to objects catalog from env.
 */
export async function listCatalogElements(opts?: {
  catalogId?: number;
  page?: number;
  limit?: number;
}): Promise<AmoCatalogElement[]> {
  const catalogId = opts?.catalogId ?? amoEnv.AMOCRM_OBJECTS_CATALOG_ID;
  const limit = opts?.limit ?? 250;
  const elements: AmoCatalogElement[] = [];
  let page = opts?.page ?? 1;

  // amoCRM paginates; loop until empty.
  while (true) {
    try {
      const data = await request<AmoCatalogListResponse>(
        "GET",
        `/catalogs/${catalogId}/elements?page=${page}&limit=${limit}`,
      );
      const batch = data._embedded?.elements ?? [];
      elements.push(...batch);
      // Paginate by amoCRM's `_links.next`, NOT by `batch.length < limit`:
      // amoCRM can return a SHORT page transiently, and stopping on it silently
      // truncates the public listings (cached 5 min). Trust the next-link.
      const next = (data as { _links?: { next?: unknown } })._links?.next;
      if (!next || batch.length === 0) break;
      page += 1;
    } catch (err) {
      if (err instanceof AmoApiError && err.status === 204) break;
      throw err;
    }
  }
  return elements;
}

export async function getCatalogElement(id: number, catalogId?: number) {
  const cid = catalogId ?? amoEnv.AMOCRM_OBJECTS_CATALOG_ID;
  return request<AmoCatalogElement>("GET", `/catalogs/${cid}/elements/${id}`);
}

/**
 * List the custom-field schema of a catalog (field code → id, enum values).
 * Used by the object writer to build a code→field_id / (code,value)→enum_id map
 * dynamically, mirroring bot/amocrm_writer.py — so the web intake stays robust
 * to enum/field changes without hardcoded IDs.
 */
export async function listCatalogCustomFields(
  catalogId?: number,
): Promise<AmoCatalogCustomField[]> {
  const cid = catalogId ?? amoEnv.AMOCRM_OBJECTS_CATALOG_ID;
  const fields: AmoCatalogCustomField[] = [];
  let page = 1;
  while (true) {
    try {
      const data = await request<AmoCustomFieldsResponse>(
        "GET",
        `/catalogs/${cid}/custom_fields?page=${page}&limit=250`,
      );
      const batch = data._embedded?.custom_fields ?? [];
      fields.push(...batch);
      const next = (data as { _links?: { next?: unknown } })._links?.next;
      if (!next || batch.length === 0) break;
      page += 1;
    } catch (err) {
      if (err instanceof AmoApiError && err.status === 204) break;
      throw err;
    }
  }
  return fields;
}

/**
 * Create one catalog element. amoCRM expects an array body and returns the
 * `{_embedded: {elements: [...]}}` envelope. Returns the created element.
 */
export async function createCatalogElement(
  input: AmoCatalogElementCreateInput,
  catalogId?: number,
): Promise<AmoCatalogElement> {
  const cid = catalogId ?? amoEnv.AMOCRM_OBJECTS_CATALOG_ID;
  const data = await request<AmoCatalogListResponse>(
    "POST",
    `/catalogs/${cid}/elements`,
    [input],
  );
  const created = data._embedded?.elements?.[0];
  if (!created) {
    throw new AmoApiError(502, JSON.stringify(data), "amoCRM create element: empty response");
  }
  return created;
}

/**
 * PATCH custom fields of an existing catalog element (used to backfill
 * fields like PHOTOS/DRIVE_FOLDER after the element exists).
 */
export async function patchCatalogElement(
  id: number,
  customFields: AmoCatalogElementCreateInput["custom_fields_values"],
  catalogId?: number,
): Promise<void> {
  const cid = catalogId ?? amoEnv.AMOCRM_OBJECTS_CATALOG_ID;
  await request<unknown>("PATCH", `/catalogs/${cid}/elements`, [
    { id, custom_fields_values: customFields },
  ]);
}

/**
 * Create a lead via /leads/complex. The endpoint returns a top-level array
 * of created entities, not the `{_embedded: {leads: []}}` envelope used by
 * most other v4 list responses.
 */
export async function createLead(input: AmoLeadCreateInput) {
  return request<Array<{ id: number; contact_id?: number; request_id?: string[] }>>(
    "POST",
    "/leads/complex",
    [input],
  );
}

export { AmoApiError };
