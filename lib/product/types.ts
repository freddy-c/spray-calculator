// Re-export Prisma's ProductType
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

// Form field type for products in the application form
export interface ApplicationProductField {
  productId: string;
  productName: string;
  productType: ProductType;
  ratePerHa: number;
}

// Product catalog item (for selection dialog)
export interface ProductCatalogItem {
  id: string;
  name: string;
  type: ProductType;
  isPublic: boolean;
}

// Product total for calculations
export interface ProductTotal {
  productId: string;
  productName: string;
  productType: ProductType;
  ratePerHa: number;
  totalAmount: number;
  unit: string;
}
