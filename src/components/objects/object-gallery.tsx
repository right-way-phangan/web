import { TreePine, Home, Building2 } from "lucide-react";
import type { ObjectType } from "@/types/object";

const TYPE_ICON: Record<ObjectType, typeof Home> = {
  Land: TreePine,
  Villa: Home,
  House: Home,
  Apartment: Building2,
  Project: Building2,
};

function hueFor(seed: string, offset = 0): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h + offset) % 360;
}

interface Props {
  rwNumber: string;
  type: ObjectType;
  gallery?: string[];
}

/**
 * Airbnb-style 1+4 layout. Once Drive photo sync lands (Day 5), this will
 * accept real image URLs; for now it renders deterministic gradient panels.
 */
export function ObjectGallery({ rwNumber, type, gallery }: Props) {
  const Icon = TYPE_ICON[type];

  // 5 deterministic hues seeded from RW number
  const tiles = [0, 60, 120, 180, 240].map((offset, i) => {
    const h1 = hueFor(rwNumber, offset);
    const h2 = hueFor(rwNumber, offset + 40);
    return {
      key: i,
      url: gallery?.[i],
      style: {
        backgroundImage: `linear-gradient(135deg, hsl(${h1} 30% 86%) 0%, hsl(${h2} 25% 76%) 100%)`,
      },
    };
  });

  return (
    <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
      {/* Hero — spans 2x2 on desktop, full on mobile */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:col-span-2 md:row-span-2 md:aspect-auto"
        style={tiles[0].url ? undefined : tiles[0].style}
      >
        {tiles[0].url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tiles[0].url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-forest-500/25">
            <Icon className="h-24 w-24" strokeWidth={0.8} />
          </div>
        )}
      </div>

      {tiles.slice(1).map((tile) => (
        <div
          key={tile.key}
          className="relative hidden aspect-[4/3] overflow-hidden rounded-sm bg-forest-500/5 md:block"
          style={tile.url ? undefined : tile.style}
        >
          {tile.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tile.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-forest-500/15">
              <Icon className="h-10 w-10" strokeWidth={0.8} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
