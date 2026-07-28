"use server";

import { getAllObjects } from "@/lib/data/objects";
import { getPublicProjects, projectSlug } from "@/lib/data/projects";
import { generateAdCreatives, type AdChannel, type CreativeSet } from "@/lib/ads/creatives";

/**
 * Собрать креативы под выбранные объекты.
 *
 * Ключ Anthropic живёт только на сервере, поэтому генерация — server action, а не
 * клиентский вызов. Объекты берём из каталога по RW-номеру, чтобы тексты нельзя
 * было построить на присланных с клиента «фактах».
 */
export async function generateCreativesAction(
  rwNumbers: string[],
  channel: AdChannel,
): Promise<CreativeSet[]> {
  const wanted = rwNumbers.filter(Boolean).slice(0, 10);
  if (wanted.length === 0) return [];

  const [all, projects] = await Promise.all([getAllObjects(), getPublicProjects()]);
  const picked = wanted
    .map((rw) => all.find((o) => o.rwNumber === rw))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  return Promise.all(
    picked.map((o) =>
      generateAdCreatives(o, channel, {
        projectSlug: o.type === "Project" ? projectSlug(o, projects) : undefined,
      }),
    ),
  );
}
