import "server-only";
import { amoEnv } from "./env";
import type {
  AmoCatalogElement,
  AmoCatalogListResponse,
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
      if (batch.length < limit) break;
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
 * Create a lead. Returns array of created leads (amoCRM convention).
 */
export async function createLead(input: AmoLeadCreateInput) {
  return request<{
    _embedded: { leads: Array<{ id: number; request_id?: string }> };
  }>("POST", "/leads/complex", [input]);
}

export { AmoApiError };
