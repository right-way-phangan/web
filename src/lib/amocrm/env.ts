import { z } from "zod";

const schema = z.object({
  AMOCRM_DOMAIN: z.string().min(1),
  AMOCRM_TOKEN: z.string().min(1),
  AMOCRM_OBJECTS_CATALOG_ID: z.coerce.number().int().positive(),
  AMOCRM_PIPELINE_LAND: z.coerce.number().int().positive(),
  AMOCRM_PIPELINE_VILLA_HOUSE: z.coerce.number().int().positive(),
});

export const amoEnv = (() => {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Missing/invalid amoCRM env vars: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}`,
    );
  }
  return parsed.data;
})();
