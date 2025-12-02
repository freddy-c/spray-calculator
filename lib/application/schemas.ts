import * as z from "zod";
import { areaTypeOptions, type AreaType } from "./types";
import { applicationProductFieldSchema } from "@/lib/product/schemas";

export const areaSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(areaTypeOptions.map((a) => a.value) as [AreaType, ...AreaType[]]),
  sizeHa: z.coerce
    .number<number>()
    .positive("Area size must be greater than 0")
    .max(1000, "Area size seems too large"),
});

export const formSchema = z.object({
  name: z.string().min(1, "Application name is required").max(100, "Name too long"),
  nozzleId: z.string().min(1, "Select a nozzle"),
  sprayVolumeLHa: z.coerce.number<number>()
    .positive("Spray volume must be greater than 0"),
  nozzleSpacingM: z.coerce.number<number>()
    .positive("Nozzle spacing must be greater than 0")
    .lt(10, "Nozzle spacing must be less than 10m"),
  nozzleCount: z.coerce.number<number>()
    .int("Nozzle count must be a whole number")
    .positive("Nozzle count must be greater than 0")
    .max(200, "Nozzle count seems too large"),
  tankSizeL: z.coerce.number<number>()
    .positive("Tank size must be greater than 0"),
  speedKmH: z.coerce.number<number>()
    .gte(3, `Min 3 km/h`)
    .lte(12, `Max 12 km/h`),
  areas: z
    .array(areaSchema)
    .min(1, "Add at least one area for this application"),
  products: z.array(applicationProductFieldSchema),
});
