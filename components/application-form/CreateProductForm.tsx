"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ProductType, PRODUCT_TYPE_LABELS } from "@/lib/product/types";
import { createProductSchema, type CreateProductInput } from "@/lib/product/schemas";
import { createCustomProduct } from "@/lib/actions/product";
import { toast } from "sonner";

interface CreateProductFormProps {
  onCancel: () => void;
  onProductCreated: (productId: string, productName: string, productType: ProductType) => void;
}

export function CreateProductForm({ onCancel, onProductCreated }: CreateProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      type: ProductType.SOLUBLE,
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const result = await createCustomProduct(data.name, data.type);
      toast.success("Custom product created");
      onProductCreated(result.id, data.name, data.type);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="product-name">Product Name</FieldLabel>
            <Input
              {...field}
              id="product-name"
              placeholder="Enter product name"
              maxLength={100}
              disabled={isSubmitting}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="product-type">Product Type</FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <SelectTrigger id="product-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProductType.SOLUBLE}>
                  {PRODUCT_TYPE_LABELS[ProductType.SOLUBLE]}
                </SelectItem>
                <SelectItem value={ProductType.LIQUID}>
                  {PRODUCT_TYPE_LABELS[ProductType.LIQUID]}
                </SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
