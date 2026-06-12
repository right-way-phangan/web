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
      <p className="mt-3 text-xs text-forest-500">
        {host}/object/{object.rwNumber} · WhatsApp {phone} ·{" "}
        {siteConfig.contact.email} · Koh Phangan, Thailand
      </p>
    </div>
  );
}
