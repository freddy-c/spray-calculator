import type { Application, ApplicationArea } from "@/app/generated/prisma/client";
import type { ApplicationProductField, ProductType } from "@/lib/domain/product/types";

/**
 * Re-export Prisma types for convenience (server-side only)
 */
export type { Application, ApplicationArea };

/**
 * Application status enum - client-safe version
 * This mirrors the Prisma enum but can be used in client components
 */
export const ApplicationStatus = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/**
 * Area with details - used in application display
 */
export type AreaWithDetails = {
  id: string;
  name: string;
  type: string;
  sizeHa: number;
};

/**
 * Application list item - for list views with computed totalAreaHa
 */
export type ApplicationListItem = Pick<
  Application,
  "id" | "name" | "status" | "scheduledDate" | "completedDate" | "createdAt" | "updatedAt"
> & {
  totalAreaHa: number;
  formattedUpdatedAt: string;
};

/**
 * Application with areas - for form editing
 */
export type ApplicationWithAreas = Pick<
  Application,
  "id" | "name" | "nozzleId" | "sprayVolumeLHa" | "nozzleSpacingM" |
  "nozzleCount" | "tankSizeL" | "speedKmH"
> & {
  areas: AreaWithDetails[];
  products: ApplicationProductField[];
};

/**
 * Application detail data - for detail/show pages
 */
export type ApplicationDetail = Pick<
  Application,
  | "id"
  | "name"
  | "status"
  | "nozzleId"
  | "sprayVolumeLHa"
  | "nozzleSpacingM"
  | "nozzleCount"
  | "tankSizeL"
  | "speedKmH"
  | "scheduledDate"
  | "completedDate"
  | "operator"
  | "weatherConditions"
  | "notes"
  | "createdAt"
  | "updatedAt"
> & {
  areas: AreaWithDetails[];
  products: ApplicationProductField[];
};

/**
 * Form input types - inferred from Zod schemas
 * Note: These are re-exported from schemas.ts
 */
export type {
  CreateApplicationInput,
  CreateApplicationOutput,
  ScheduleApplicationInput,
  ScheduleApplicationOutput,
  CompleteApplicationInput,
  CompleteApplicationOutput,
} from "./schemas";

/**
 * Pressure status for spray calculations
 */
export type PressureStatus = "ok" | "low" | "high";

/**
 * Calculated spray metrics
 */
export type SprayMetrics = {
  flowPerNozzleLMin: number;
  requiredPressureBar: number;
  speedKmH: number;
  pressureStatus: PressureStatus;
  totalAreaHa: number;
  totalSprayVolumeL: number;
  tanksRequired: number;
  sprayTimeMinutes: number;
  productTotals: Array<{
    productId: string;
    productName: string;
    productType: ProductType;
    ratePerHa: number;
    totalAmount: number;
    unit: string;
  }>;
};

