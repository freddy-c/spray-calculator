import type { Area } from "@/app/generated/prisma/client";

/**
 * Re-export Prisma types for convenience (server-side only)
 */
export type { Area };

/**
 * Area type enum - client-safe version
 * This mirrors the Prisma enum but can be used in client components
 */
export const AreaType = {
  GREEN: "GREEN",
  TEE: "TEE",
  FAIRWAY: "FAIRWAY",
  ROUGH: "ROUGH",
  FIRST_CUT: "FIRST_CUT",
  APRON: "APRON",
  COLLAR: "COLLAR",
  PATH: "PATH",
  OTHER: "OTHER",
} as const;

export type AreaType = (typeof AreaType)[keyof typeof AreaType];

export type AreaListItem = Pick<
  Area,
  "id" | "name" | "type" | "sizeHa" | "createdAt" | "updatedAt"
>;

/**
 * Area type options for select fields
 */
export const areaTypeOptions = [
  { value: AreaType.GREEN, label: "Green" },
  { value: AreaType.TEE, label: "Tee" },
  { value: AreaType.FAIRWAY, label: "Fairway" },
  { value: AreaType.ROUGH, label: "Rough" },
  { value: AreaType.FIRST_CUT, label: "First Cut" },
  { value: AreaType.APRON, label: "Apron" },
  { value: AreaType.COLLAR, label: "Collar" },
  { value: AreaType.PATH, label: "Path" },
  { value: AreaType.OTHER, label: "Other" },
];
