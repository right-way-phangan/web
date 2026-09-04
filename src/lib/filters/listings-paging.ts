/**
 * Link-based paging for the catalogue. Cards are rendered in batches on the
 * client, but the "show more" control is a real link (`?page=N`) so crawlers
 * reach every listing from /listings — SSR renders N batches for `?page=N`.
 * The click itself is intercepted and expands in place (no navigation).
 */
export function pageFromParams(value: string | null | undefined): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 50) : 1;
}

/** Href of the batch after the one currently shown, keeping the other filters. */
export function nextPageHref(
  pathname: string,
  search: string,
  shownCount: number,
  pageSize: number,
): string {
  const params = new URLSearchParams(search);
  const nextPage = Math.max(1, Math.ceil(shownCount / pageSize)) + 1;
  params.set("page", String(nextPage));
  return `${pathname}?${params.toString()}`;
}
