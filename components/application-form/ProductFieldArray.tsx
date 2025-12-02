"use client";

import { useState } from "react";
import { Controller, type Control, type FieldArrayWithId, type FieldErrors } from "react-hook-form";
import { X } from "lucide-react";
import { type FormValues } from "@/lib/application";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPE_UNITS, type ProductCatalogItem } from "@/lib/product/types";
import { ProductCatalogDialog } from "./ProductCatalogDialog";

type ProductFieldArrayProps = {
  control: Control<FormValues>;
  fields: FieldArrayWithId<FormValues, "products", "id">[];
  append: (value: FormValues["products"][number]) => void;
  remove: (index: number) => void;
  errors: FieldErrors<FormValues>;
};

export function ProductFieldArray({ control, fields, append, remove, errors }: ProductFieldArrayProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleProductSelected = (product: ProductCatalogItem) => {
    append({
      productId: product.id,
      productName: product.name,
      productType: product.type,
      ratePerHa: 0,
    });
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Products</FieldLegend>
      <FieldDescription>
        Add products to be applied in this spray application.
      </FieldDescription>

      <div className="space-y-4">
        {fields.map((product, index) => (
          <div key={product.id} className="space-y-3 p-4 border rounded-md">
            {/* Product Name (read-only) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium">{product.productName}</p>
                <Badge variant="secondary">
                  {PRODUCT_TYPE_LABELS[product.productType]}
                </Badge>
              </div>
            </div>

            {/* Application Rate */}
            <Controller
              name={`products.${index}.ratePerHa`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`input-products-${index}-ratePerHa`}>
                    Application Rate ({PRODUCT_TYPE_UNITS[product.productType]})
                  </FieldLabel>
                  <Input
                    {...controllerField}
                    type="number"
                    inputMode="numeric"
                    step={0.01}
                    id={`input-products-${index}-ratePerHa`}
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Hidden fields to maintain product info */}
            <Controller
              name={`products.${index}.productId`}
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <Controller
              name={`products.${index}.productName`}
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <Controller
              name={`products.${index}.productType`}
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {/* Remove button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => remove(index)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Product
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => setDialogOpen(true)}
        >
          Add Product
        </Button>
      </div>

      {/* Overall products error */}
      {errors.products?.root && (
        <FieldError errors={[errors.products.root]} />
      )}

      {/* Product Catalog Dialog */}
      <ProductCatalogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProductSelected={handleProductSelected}
      />
    </FieldSet>
  );
}