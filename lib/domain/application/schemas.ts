import { z } from "zod";
import { applicationProductFieldSchema } from "@/lib/domain/product/schemas";

/**
 * Schema for application area reference
 */
export const applicationAreaRefSchema = z.object({
  areaId: z.string().min(1, "Select an area"),
});

/**
 * Schema for creating/updating an application
 */
export const createApplicationSchema = z.object({
  name: z.string().min(1, "Application name is required").max(100, "Name too long"),
  nozzleId: z.string().min(1, "Select a nozzle"),
  sprayVolumeLHa: z.coerce.number()
    .positive("Spray volume must be greater than 0"),
  nozzleSpacingM: z.coerce.number()
    .positive("Nozzle spacing must be greater than 0")
    .lt(10, "Nozzle spacing must be less than 10m"),
  nozzleCount: z.coerce.number()
    .int("Nozzle count must be a whole number")
    .positive("Nozzle count must be greater than 0")
    .max(200, "Nozzle count seems too large"),
  tankSizeL: z.coerce.number()
    .positive("Tank size must be greater than 0"),
  speedKmH: z.coerce.number()
    .gte(3, "Min 3 km/h")
    .lte(12, "Max 12 km/h"),
  areas: z
    .array(applicationAreaRefSchema)
    .min(1, "Add at least one area for this application")
    .refine(
      (areas) => {
        const areaIds = areas.map((a) => a.areaId);
        return new Set(areaIds).size === areaIds.length;
      },
      { message: "Duplicate areas are not allowed" }
    ),
  products: z.array(applicationProductFieldSchema),
});

/**
 * Schema for scheduling an application
 */
export const scheduleApplicationSchema = z.object({
  scheduledDate: z.string().min(1, "Scheduled date is required"),
});

/**
 * Schema for completing an application
 */
export const completeApplicationSchema = z.object({
  completedDate: z.string().min(1, "Completed date is required"),
  operator: z.string().optional(),
  weatherConditions: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Inferred types from schemas - exported for convenience
 * Using z.input for form inputs (before coercion) and z.output for API/logic (after coercion)
 */
export type ApplicationAreaRef = z.infer<typeof applicationAreaRefSchema>;
export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type CreateApplicationOutput = z.output<typeof createApplicationSchema>;
export type ScheduleApplicationInput = z.input<typeof scheduleApplicationSchema>;
export type ScheduleApplicationOutput = z.output<typeof scheduleApplicationSchema>;
export type CompleteApplicationInput = z.input<typeof completeApplicationSchema>;
export type CompleteApplicationOutput = z.output<typeof completeApplicationSchema>;