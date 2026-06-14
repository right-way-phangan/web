import type { RealEstateObject } from "@/types/object";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Print-only photo sheet + contact line for the listing brochure (the
 * interactive gallery is print-hidden). Plain <img> on purpose: next/image
 * lazy-loads, and a photo that never entered the viewport would print blank.
 */
export function PrintBrochure({ object }: { object: RealEstateObject }) {
  const photos = (object.gallery ?? []).filter(Boolean).slice(0, 4);
  const host = getSiteUrl().replace(/^https?:\/\//, "");
  const phone = `+${siteConfig.contact.whatsapp}`;
  const hasCoords = object.lat != null && object.lng != null;

  return (
    <div className="hidden print:block">
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${object.titleEn} (${object.rwNumber}) — photo ${i + 1}`}
              className="aspect-[4/3] w-full object-cover"
              loading="eager"
            />
          ))}
        </div>
      ) : null}
      {hasCoords ? (
        <div className="mt-2">
          {/* Server-composed static map (interactive Leaflet is print-hidden). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/staticmap?lat=${object.lat}&lng=${object.lng}&z=15&w=720&h=300`}
            alt={`Location of ${object.titleEn} (${object.rwNumber}) on Koh Phangan`}
            className="aspect-[12/5] w-full object-cover"
            loading="eager"
          />
        </div>
      ) : null}
      <p className="mt-3 text-xs text-forest-500">
        {host}/object/{object.rwNumber} · WhatsApp {phone} ·{" "}
        {siteConfig.contact.email} · Koh Phangan, Thailand
      </p>
    </div>
  );
}
