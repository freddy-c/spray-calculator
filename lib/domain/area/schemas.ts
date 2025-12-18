import { z } from "zod";
import { AreaType } from "./types";

const areaTypeEnum = z.enum([
  AreaType.GREEN,
  AreaType.TEE,
  AreaType.FAIRWAY,
  AreaType.ROUGH,
  AreaType.FIRST_CUT,
  AreaType.APRON,
  AreaType.COLLAR,
  AreaType.PATH,
  AreaType.OTHER,
]);

export const createAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: areaTypeEnum,
  sizeHa: z.coerce.number().positive("Size must be greater than 0"),
});

export const updateAreaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  type: areaTypeEnum,
  sizeHa: z.coerce.number().positive("Size must be greater than 0"),
});

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
