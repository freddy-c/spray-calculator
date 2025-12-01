import { z } from "zod";
import { ProductType } from "./types";

export const productTypeSchema = z.enum([ProductType.SOLUBLE, ProductType.LIQUID]);

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  type: productTypeSchema,
});

export const applicationProductFieldSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  productType: productTypeSchema,
  ratePerHa: z.coerce.number<number>()
    .positive("Application rate must be positive")
    .max(1000, "Application rate must be less than 1000"),
});

export const productCatalogFilterSchema = z.object({
  searchQuery: z.string(),
  typeFilter: z.union([z.literal("all"), productTypeSchema]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ApplicationProductFieldInput = z.infer<
  typeof applicationProductFieldSchema
>;
export type ProductCatalogFilterInput = z.infer<typeof productCatalogFilterSchema>;
