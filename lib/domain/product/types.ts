import type { Product } from "@/app/generated/prisma/client";
import type { z } from "zod";
import type { createProductSchema, applicationProductFieldSchema } from "./schemas";

/**
 * Re-export Prisma types for convenience (server-side only)
 */
export type { Product };

/**
 * Product type enum - client-safe version
 * This mirrors the Prisma enum but can be used in client components
 */
export const ProductType = {
  SOLUBLE: "SOLUBLE",
  LIQUID: "LIQUID",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.SOLUBLE]: "Soluble",
  [ProductType.LIQUID]: "Liquid",
};

export const PRODUCT_TYPE_UNITS: Record<ProductType, string> = {
  [ProductType.SOLUBLE]: "kg/ha",
  [ProductType.LIQUID]: "L/ha",
};

export const PRODUCT_TYPE_TOTAL_UNITS: Record<ProductType, string> = {
  [ProductType.SOLUBLE]: "kg",
  [ProductType.LIQUID]: "L",
};

/**
 * Form field type for products in the application form
 */
export type ApplicationProductField = {
  productId: string;
  productName: string;
  productType: ProductType;
  ratePerHa: number;
};

/**
 * Product catalog item - for product selection dialogs
 */
export type ProductCatalogItem = Pick<Product, "id" | "name" | "type" | "isPublic">;

/**
 * Product total for calculations - includes computed total amount
 */
export type ProductTotal = {
  productId: string;
  productName: string;
  productType: ProductType;
  ratePerHa: number;
  totalAmount: number;
  unit: string;
};

/**
 * Form input types - inferred from Zod schemas
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ApplicationProductFieldInput = z.infer<typeof applicationProductFieldSchema>;
