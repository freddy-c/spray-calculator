"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  createArea,
  updateArea,
  type AreaListItem,
  type CreateAreaInput,
  type UpdateAreaInput,
  createAreaSchema,
  updateAreaSchema,
  AreaType,
  areaTypeOptions,
} from "@/lib/domain/area";

interface AreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  area?: AreaListItem;
}

export function AreaDialog({
  open,
  onOpenChange,
  mode,
  area,
}: AreaDialogProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(createAreaSchema),
    defaultValues:
      mode === "edit" && area
        ? {
            name: area.name,
            type: area.type,
            sizeHa: area.sizeHa,
          }
        : {
            name: "",
            type: AreaType.GREEN,
            sizeHa: 0,
          },
  });

  async function onSubmit(values: CreateAreaInput) {
    const result =
      mode === "create"
        ? await createArea(values)
        : await updateArea({ ...values, id: area!.id });

    if (result.success) {
      toast.success(
        mode === "create"
          ? "Area created successfully"
          : "Area updated successfully"
      );
      onOpenChange(false);
      reset();
      router.refresh();
    } else {
      toast.error(result.error || "An error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Area" : "Edit Area"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new area to your golf course"
              : "Update the area details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="area-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="area-name"
                  placeholder="e.g., 1st Green"
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
                <FieldLabel htmlFor="area-type">Type</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="area-type">
                    <SelectValue placeholder="Select area type" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="sizeHa"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="area-size">Size (hectares)</FieldLabel>
                <Input
                  {...field}
                  id="area-size"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                  value={(field.value ?? "") as string | number}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}