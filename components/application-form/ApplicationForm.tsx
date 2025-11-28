"use client";

import { Controller } from "react-hook-form";
import { nozzleCatalog } from "@/lib/data/nozzle-catalog";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaFieldArray } from "./AreaFieldArray";
import { LiveCalculationsCard } from "./LiveCalculationsCard";

export function ApplicationForm() {
  const { form, control, areaFields, appendArea, removeArea, metrics, onSubmit } = useApplicationForm();

  const watchedSprayVolume = form.watch("sprayVolumeLHa");

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] items-start">
        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle>Spray Calculator</CardTitle>
            <CardDescription>
              Tune your spray settings and see pressure and flow update instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="spray-calculator-form" onSubmit={onSubmit}>
              <FieldGroup>
                <AreaFieldArray
                  control={control}
                  fields={areaFields}
                  append={appendArea}
                  remove={removeArea}
                  errors={form.formState.errors}
                />

                {/* Application rate */}
                <Controller
                  name="sprayVolumeLHa"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="input-sprayVolumeLHa">
                        Spray volume (L/ha)
                      </FieldLabel>
                      <FieldDescription>Enter the target application rate.</FieldDescription>
                      <Input
                        id="input-sprayVolumeLHa"
                        type="number"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                        placeholder="300"
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <FieldSeparator>Sprayer</FieldSeparator>

                {/* Nozzle */}
                <Controller
                  name="nozzleId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FieldSet data-invalid={fieldState.invalid}>
                      <FieldLegend variant="label">Nozzle</FieldLegend>
                      <FieldDescription>
                        Choose the nozzle fitted to your sprayer.
                      </FieldDescription>
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="sr-only" htmlFor="input-nozzle">
                          Nozzle
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="input-nozzle" aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {Object.values(nozzleCatalog).map((nozzle) => (
                                <SelectItem key={nozzle.id} value={nozzle.id}>
                                  {nozzle.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldSet>
                  )}
                />

                {/* Nozzle Spacing */}
                <Controller
                  name="nozzleSpacingM"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="input-nozzleSpacingM">
                        Nozzle spacing (m)
                      </FieldLabel>
                      <FieldDescription>Spacing between nozzles along the boom.</FieldDescription>
                      <Input
                        id="input-nozzleSpacingM"
                        type="number"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                        placeholder="0.5"
                        step={0.1}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Tank Size */}
                <Controller
                  name="tankSizeL"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="input-tankSizeL">Tank size (L)</FieldLabel>
                      <FieldDescription>How much liquid your tank holds when full.</FieldDescription>
                      <Input
                        id="input-tankSizeL"
                        type="number"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                        placeholder="400"
                        step={10}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Speed */}
                <Controller
                  name="speedKmH"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="input-speedKmH">
                        Speed (km/h)
                      </FieldLabel>
                      <FieldDescription>Drag to match your driving speed. Current: {field.value.toFixed(1)} km/h</FieldDescription>
                      <Slider
                        id="input-speedKmH"
                        min={3}
                        max={12}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="border-t">
            <Field orientation="horizontal">
              <Button type="submit" form="spray-calculator-form">
                Save settings
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
            </Field>
          </CardFooter>
        </Card>

        {/* Right: sticky live calculations card */}
        <div className="lg:sticky lg:top-10">
          <LiveCalculationsCard
            metrics={metrics}
            sprayVolumeLHa={Number(watchedSprayVolume) || 0}
          />
        </div>
      </div>
    </div>
  );
}
