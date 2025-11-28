"use client";

import { Controller, type Control, type FieldArrayWithId, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { X } from "lucide-react";
import { areaTypeOptions, type FormValues } from "@/lib/application";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type AreaFieldArrayProps = {
  control: Control<FormValues>;
  fields: FieldArrayWithId<FormValues, "areas", "id">[];
  append: (value: FormValues["areas"][number]) => void;
  remove: (index: number) => void;
  errors: FieldErrors<FormValues>;
};

export function AreaFieldArray({ control, fields, append, remove, errors }: AreaFieldArrayProps) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Areas to be sprayed</FieldLegend>
      <FieldDescription>
        Define the areas you will be spraying.
      </FieldDescription>
      <div className="space-y-3">
        {/* Header labels (desktop only) */}
        <div className="hidden md:flex flex-col gap-4  md:flex-row md:items-end">
          <FieldLabel className="flex-1">Label</FieldLabel>
          <FieldLabel className="flex-1">Type</FieldLabel>
          <FieldLabel className="w-24 md:w-24 text-right">Size (ha)</FieldLabel>
          <FieldLabel className="w-16">Actions</FieldLabel>
        </div>
        {fields.map((area, index) => (
          <div key={area.id} className="flex flex-col gap-4 md:flex-row md:items-end p-4 rounded-md border md:border-0 md:p-0">
            <div className="flex-1">
              <Controller
                name={`areas.${index}.label`}
                control={control}
                render={({ field: controllerField, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`input-areas-${index}-label`} className="text-sm md:sr-only">
                      Label
                    </FieldLabel>
                    <Input
                      {...controllerField}
                      id={`input-areas-${index}-label`}
                      placeholder="Greens"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <div className="md:hidden"><FieldError errors={[fieldState.error]} /></div>
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex-1">
              <Controller
                name={`areas.${index}.type`}
                control={control}
                render={({ field: controllerField, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor={`input-areas-${index}-type`}
                      className="text-sm md:sr-only"
                    >
                      Type
                    </FieldLabel>
                    <Select
                      value={controllerField.value}
                      onValueChange={controllerField.onChange}
                    >
                      <SelectTrigger
                        id={`input-areas-${index}-type`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {areaTypeOptions.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <div className="md:hidden"><FieldError errors={[fieldState.error]} /></div>
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="md:w-24">
              <Controller
                name={`areas.${index}.sizeHa`}
                control={control}
                render={({ field: controllerField, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`input-areas-${index}-sizeHa`} className="text-sm md:sr-only">
                      Size (ha)
                    </FieldLabel>
                    <Input
                      {...controllerField}
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      id={`input-areas-${index}-sizeHa`}
                      placeholder="0.5"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <div className="md:hidden"><FieldError errors={[fieldState.error]} /></div>
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="md:w-16">
              <Button className="w-full md:w-9" type="button" variant="outline" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                <X />
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({
            label: "",
            type: "other",
            sizeHa: 0.5,
          })}
        >
          Add Area
        </Button>
      </div>

      {/* Overall areas error (min 1) */}
      {errors.areas?.root && (
        <FieldError errors={[errors.areas.root]} />
      )}
    </FieldSet>
  );
}
