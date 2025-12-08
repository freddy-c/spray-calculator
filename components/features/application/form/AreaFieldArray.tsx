"use client";

import { Controller, type Control, type FieldArrayWithId, type FieldErrors } from "react-hook-form";
import { X } from "lucide-react";
import { areaTypeOptions, type CreateApplicationInput } from "@/lib/domain/application";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type AreaFieldArrayProps = {
  control: Control<CreateApplicationInput>;
  fields: FieldArrayWithId<CreateApplicationInput, "areas", "id">[];
  append: (value: CreateApplicationInput["areas"][number]) => void;
  remove: (index: number) => void;
  errors: FieldErrors<CreateApplicationInput>;
};

export function AreaFieldArray({ control, fields, append, remove, errors }: AreaFieldArrayProps) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Areas to be sprayed</FieldLegend>
      <FieldDescription>
        Define the areas you will be spraying.
      </FieldDescription>

      <div className="space-y-4">
        {fields.map((area, index) => (
          <div key={area.id} className="space-y-3 p-4 border rounded-md">
            {/* Label */}
            <Controller
              name={`areas.${index}.label`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`input-areas-${index}-label`}>
                    Label
                  </FieldLabel>
                  <Input
                    {...controllerField}
                    id={`input-areas-${index}-label`}
                    placeholder="Greens"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Type */}
            <Controller
              name={`areas.${index}.type`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`input-areas-${index}-type`}>
                    Type
                  </FieldLabel>
                  <Select
                    value={controllerField.value}
                    onValueChange={controllerField.onChange}
                  >
                    <SelectTrigger id={`input-areas-${index}-type`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {areaTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Size */}
            <Controller
              name={`areas.${index}.sizeHa`}
              control={control}
              render={({ field: controllerField, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`input-areas-${index}-sizeHa`}>
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
                    value={(controllerField.value ?? "") as string | number}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Remove button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Area
            </Button>
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
