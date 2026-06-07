import { z } from "zod";

const schema = z.object({
  AMOCRM_DOMAIN: z.string().min(1),
  AMOCRM_TOKEN: z.string().min(1),
  AMOCRM_OBJECTS_CATALOG_ID: z.coerce.number().int().positive(),
  AMOCRM_PIPELINE_LAND: z.coerce.number().int().positive(),
  AMOCRM_PIPELINE_VILLA_HOUSE: z.coerce.number().int().positive(),
});

type AmoEnv = z.infer<typeof schema>;

let cached: AmoEnv | null = null;

function loadAmoEnv(): AmoEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Missing/invalid amoCRM env vars: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}`,
    );
  }
  cached = parsed.data;
  return cached;
}

/**
 * Lazily-validated amoCRM env. Validation runs on first property access, not at
 * import — so importing this module never throws. That matters because the
 * amoCRM client is reachable from an edge-runtime route (object OG image): at
 * `next build` page-data collection the edge bundle is imported without the env
 * present, and a top-level throw there fails the whole build. A field is only
 * read at request time, where the env is available.
 */
export const amoEnv: AmoEnv = new Proxy({} as AmoEnv, {
  get(_target, prop: string) {
    return loadAmoEnv()[prop as keyof AmoEnv];
  },
});
