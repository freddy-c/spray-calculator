"use client";

import { Controller } from "react-hook-form";
import { nozzleCatalog } from "@/lib/data/nozzle-catalog";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaFieldArray } from "./AreaFieldArray";
import { ProductFieldArray } from "./ProductFieldArray";
import { LiveCalculationsCard } from "./LiveCalculationsCard";
import type { FormValues } from "@/lib/application/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ApplicationFormProps = {
  mode?: "create" | "edit";
  initialValues?: Partial<FormValues>;
  applicationId?: string;
  onSuccess?: () => void;
};

export function ApplicationForm({ mode = "create", initialValues, applicationId, onSuccess }: ApplicationFormProps) {
  const { form, control, areaFields, appendArea, removeArea, productFields, appendProduct, removeProduct, metrics, isSubmitting, onSubmit } = useApplicationForm({
    mode,
    initialValues,
    applicationId,
    onSuccess,
  });

  const watchedSprayVolume = form.watch("sprayVolumeLHa");

  return (
    <div className="container mx-auto mt-10 mb-10 px-4">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] items-start">
        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle>{mode === "edit" ? "Edit Application" : "New Application"}</CardTitle>
            <CardDescription>
              Tune your spray settings and see pressure and flow update instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="spray-calculator-form" onSubmit={onSubmit}>
              <FieldGroup>
                {/* Application Name */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="input-name">
                        Application name
                      </FieldLabel>
                      <FieldDescription>Give this application a descriptive name.</FieldDescription>
                      <Input
                        id="input-name"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g., Spring Greens Treatment"
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <FieldSeparator>Areas</FieldSeparator>

                <AreaFieldArray
                  control={control}
                  fields={areaFields}
                  append={appendArea}
                  remove={removeArea}
                  errors={form.formState.errors}
                />

                <FieldSeparator>Products</FieldSeparator>

                <ProductFieldArray
                  control={control}
                  fields={productFields}
                  append={appendProduct}
                  remove={removeProduct}
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

                {/* Nozzle Count */}
                <Controller
                  name="nozzleCount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="input-nozzleCount">
                        Nozzle count
                      </FieldLabel>
                      <FieldDescription>Total number of nozzles on the boom.</FieldDescription>
                      <Input
                        id="input-nozzleCount"
                        type="number"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                        placeholder="40"
                        step={1}
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
        </Card>

        {/* Right: sticky live calculations card */}
        <div className="lg:sticky lg:top-10">
          <LiveCalculationsCard
            metrics={metrics}
            sprayVolumeLHa={Number(watchedSprayVolume) || 0}
            isSubmitting={isSubmitting}
            onReset={() => form.reset()}
          />
        </div>
      </div>
    </div>
  );
}
