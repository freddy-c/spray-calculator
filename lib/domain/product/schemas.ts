import { z } from "zod";
import { ProductType } from "./types";

/**
 * Schema for product type enum
 */
export const productTypeSchema = z.enum([ProductType.SOLUBLE, ProductType.LIQUID]);

/**
 * Schema for creating a new product
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  type: productTypeSchema,
});

/**
 * Schema for application product field (used in application forms)
 */
export const applicationProductFieldSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  productType: productTypeSchema,
  ratePerHa: z.coerce.number()
    .positive("Application rate must be positive")
    .max(1000, "Application rate must be less than 1000"),
});

/**
 * Schema for product catalog filter parameters
 */
export const productCatalogFilterSchema = z.object({
  searchQuery: z.string(),
  typeFilter: z.union([z.literal("all"), productTypeSchema]),
});

/**
 * Inferred types from schemas - exported for convenience
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ApplicationProductFieldInput = z.infer<typeof applicationProductFieldSchema>;
export type ProductCatalogFilterInput = z.infer<typeof productCatalogFilterSchema>;
