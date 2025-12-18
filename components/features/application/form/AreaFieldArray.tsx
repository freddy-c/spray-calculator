"use client";

import { X, Plus } from "lucide-react";
import { Controller, type Control, type FieldArrayWithId, type FieldErrors } from "react-hook-form";
import type { CreateApplicationInput } from "@/lib/domain/application";
import type { AreaListItem } from "@/lib/domain/area";
import { Field, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";

type AreaFieldArrayProps = {
  control: Control<CreateApplicationInput>;
  fields: FieldArrayWithId<CreateApplicationInput, "areas", "id">[];
  append: (value: CreateApplicationInput["areas"][number]) => void;
  remove: (index: number) => void;
  availableAreas: AreaListItem[];
};

const areaTypeLabels: Record<string, string> = {
  GREEN: "Green",
  TEE: "Tee",
  FAIRWAY: "Fairway",
  ROUGH: "Rough",
  FIRST_CUT: "First Cut",
  APRON: "Apron",
  COLLAR: "Collar",
  PATH: "Path",
  OTHER: "Other",
};

export function AreaFieldArray({
  control,
  fields,
  append,
  remove,
  availableAreas,
}: AreaFieldArrayProps) {
  const selectedAreaIds = useMemo(
    () => fields.map((f) => f.areaId),
    [fields]
  );

  // Get available areas for a specific field
  // This includes unselected areas AND the currently selected area for this field
  const getAvailableAreasForField = (currentValue: string) => {
    return availableAreas.filter(
      (area) => !selectedAreaIds.includes(area.id) || area.id === currentValue
    );
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Areas</FieldLegend>
      <FieldDescription>
        Select the areas you will be spraying from your saved areas.
      </FieldDescription>

      <div className="space-y-4">
        {fields.map((area, index) => (
          <div key={area.id} className="space-y-4">
            <Controller
              name={`areas.${index}.areaId`}
              control={control}
              render={({ field: controllerField, fieldState }) => {
                const availableAreasForField = getAvailableAreasForField(controllerField.value ?? "");

                return (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <Field data-invalid={fieldState.invalid}>
                      <Select
                        value={controllerField.value ?? ""}
                        onValueChange={(val) => controllerField.onChange(val)}
                      >
                        <SelectTrigger id={`input-areas-${index}-areaId`} aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Select an area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {availableAreasForField.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.name} ({areaTypeLabels[area.type]}, {area.sizeHa.toFixed(2)} ha)
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                );
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
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
          onClick={() => append({ areaId: "" })}
        >
          Add Area
        </Button>
      </div>
    </FieldSet>
  );
}