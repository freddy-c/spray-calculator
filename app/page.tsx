"use client";

import { useMemo } from "react";
import * as z from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { X } from "lucide-react";

const areaTypeOptions = [
  { value: "green", label: "Green" },
  { value: "tee", label: "Tee" },
  { value: "fairway", label: "Fairway" },
  { value: "rough", label: "Rough" },
  { value: "other", label: "Other" },
] as const;

type AreaType = (typeof areaTypeOptions)[number]["value"];

const areaSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(areaTypeOptions.map((a) => a.value) as [AreaType, ...AreaType[]]),
  sizeHa: z.coerce
    .number<number>()
    .positive("Area size must be greater than 0")
    .max(1000, "Area size seems too large"),
});

type NozzleSpec = {
  id: string;
  label: string;
  brand: string;
  kFactor: number;
  minPressureBar: number;
  maxPressureBar: number;
};

const nozzleCatalog: Record<string, NozzleSpec> = {
  "syngenta-025-xc": {
    id: "syngenta-025-xc",
    label: "Syngenta 025 XC",
    brand: "syngenta",
    kFactor: 0.577,
    minPressureBar: 1,
    maxPressureBar: 4,
  },
  "syngenta-04-xc": {
    id: "syngenta-04-xc",
    label: "Syngenta 04 XC",
    brand: "syngenta",
    kFactor: 0.924,
    minPressureBar: 1,
    maxPressureBar: 4,
  },
  "syngenta-08-xc": {
    id: "syngenta-08-xc",
    label: "Syngenta 08 XC",
    brand: "syngenta",
    kFactor: 1.848,
    minPressureBar: 1,
    maxPressureBar: 4,
  },
  "teejet-aixr11004": {
    id: "teejet-aixr11004",
    label: "TeeJet AIXR11004",
    brand: "teejet",
    kFactor: 0.91,
    minPressureBar: 1,
    maxPressureBar: 6,
  },
  "teejet-xrc11004": {
    id: "teejet-xrc11004",
    label: "TeeJet XRC11004",
    brand: "teejet",
    kFactor: 0.91,
    minPressureBar: 1,
    maxPressureBar: 6,
  },
};

const formSchema = z.object({
  nozzleId: z.string().min(1, "Select a nozzle"),
  sprayVolumeLHa: z.coerce.number<number>()
    .positive("Spray volume must be greater than 0"),
  nozzleSpacingM: z.coerce.number<number>()
    .positive("Nozzle spacing must be greater than 0")
    .lt(10, "Nozzle spacing must be less than 10m"),
  tankSizeL: z.coerce.number<number>()
    .positive("Tank size must be greater than 0"),
  speedKmH: z.coerce.number<number>()
    .gte(3, `Min 3 km/h`)
    .lte(12, `Max 12 km/h`),
  areas: z
    .array(areaSchema)
    .min(1, "Add at least one area for this application"),
})

type FormValues = z.infer<typeof formSchema>;

type PressureStatus = "ok" | "low" | "high";

type SprayMetrics = {
  flowPerNozzleLMin: number;
  requiredPressureBar: number;
  speedKmH: number;
  pressureStatus: PressureStatus;
  totalAreaHa: number;
  totalSprayVolumeL: number;
  tanksRequired: number;
};

function calculateSprayMetrics(values: FormValues): SprayMetrics {
  const sprayVolume = values.sprayVolumeLHa;
  const nozzleSpacing = values.nozzleSpacingM;
  const speedKmH = values.speedKmH;

  const nozzle = nozzleCatalog[values.nozzleId];

  // nozzle related calculations
  const flowPerNozzleLMin = (sprayVolume * speedKmH * nozzleSpacing) / 600;
  const requiredPressureBar = Math.pow(sprayVolume * speedKmH * nozzleSpacing / (600 * nozzle.kFactor), 2);

  const pressureStatus: PressureStatus =
    requiredPressureBar < nozzle.minPressureBar
      ? "low"
      : requiredPressureBar > nozzle.maxPressureBar
        ? "high"
        : "ok";

  // area / tank-related
  const totalAreaHa = values.areas.reduce(
    (sum, area) => sum + (Number.isFinite(area.sizeHa) ? area.sizeHa : 0),
    0
  );

  const totalSprayVolumeL = totalAreaHa * sprayVolume;

  const tanksRequired =
    totalSprayVolumeL > 0 && values.tankSizeL > 0
      ? Math.ceil(totalSprayVolumeL / values.tankSizeL)
      : 0;

  return {
    flowPerNozzleLMin,
    requiredPressureBar,
    speedKmH,
    pressureStatus,
    totalAreaHa,
    totalSprayVolumeL,
    tanksRequired,
  };
}

type LiveCalculationsCardProps = {
  metrics: SprayMetrics | null;
  sprayVolumeLHa: number;
};

function LiveCalculationsCard({ metrics, sprayVolumeLHa }: LiveCalculationsCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Live calculations</CardTitle>
        <CardDescription>
          Values update as you adjust any setting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* First row: nozzle & pressure */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">
                  Nozzle flow
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>The nozzle output for one nozzle</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.flowPerNozzleLMin.toFixed(2) : "—"} L/min
            </p>
          </div>

          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">
                  Pressure
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>The pressure at the nozzle</p>
              </TooltipContent>
            </Tooltip>
            <p
              className={`text-xl font-semibold ${metrics?.pressureStatus === "ok"
                ? "text-emerald-700"
                : "text-destructive"
                }`}
            >
              {metrics ? metrics.requiredPressureBar.toFixed(2) : "—"} bar
            </p>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Speed</p>
            <p className="text-xl font-semibold">
              {metrics ? metrics.speedKmH.toFixed(2) : "—"} km/h
            </p>
          </div>
        </div>

        {/* Second row: area & tanks */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Total area</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sum of all areas receiving this application.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.totalAreaHa.toFixed(3) : "—"} ha
            </p>
          </div>

          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Spray volume</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total liquid required at {sprayVolumeLHa} L/ha.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.totalSprayVolumeL.toFixed(0) : "—"} L
            </p>
          </div>

          <div className="rounded-md border p-3">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-sm text-muted-foreground">Tanks required</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of full tanks to cover the total area.</p>
              </TooltipContent>
            </Tooltip>
            <p className="text-xl font-semibold">
              {metrics ? metrics.tanksRequired : "—"}
            </p>
          </div>
        </div>

        {metrics?.pressureStatus !== "ok" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              {metrics?.pressureStatus === "low" &&
                "Pressure is below the recommended range — consider increasing speed or increasing spray volume."}
              {metrics?.pressureStatus === "high" &&
                "Pressure is above the recommended range — consider reducing speed or reducing spray volume."}
              {!metrics && "Enter values to see pressure guidance."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function Home() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nozzleId: "syngenta-025-xc",
      sprayVolumeLHa: 300,
      nozzleSpacingM: 0.5,
      tankSizeL: 400,
      speedKmH: 5,
      areas: [
        {
          label: "Greens",
          type: "green",
          sizeHa: 1,
        },
      ],
    },
    mode: "onChange",
  })

  const { control, handleSubmit, watch } = form;

  const {
    fields: areaFields,
    append: appendArea,
    remove: removeArea,
  } = useFieldArray({
    control,
    name: "areas",
  });

  const watchedValues = watch();

  const metrics = useMemo(() => {
    const parsed = formSchema.safeParse(watchedValues);
    if (!parsed.success) return null;
    return calculateSprayMetrics(parsed.data);
  }, [watchedValues]);

  function onSubmit(data: FormValues) {
    console.log("Submitted data:", data);
  }

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
            <form id="spray-calculator-form" onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
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
                    {areaFields.map((area, index) => (
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
                          <Button className="w-full md:w-9" type="button" variant="outline" size="icon" disabled={areaFields.length === 1} onClick={() => removeArea(index)}>
                            <X />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      // size="sm"
                      onClick={() => appendArea({
                        label: "",
                        type: "other",
                        sizeHa: 0.5,
                      })}
                    >
                      Add Area
                    </Button>
                  </div>

                  {/* Overall areas error (min 1) */}
                  {form.formState.errors.areas?.root && (
                    <FieldError errors={[form.formState.errors.areas.root]} />
                  )}
                </FieldSet>


                {/* Application rate */}
                <Controller
                  name="sprayVolumeLHa"
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
            sprayVolumeLHa={Number(watchedValues.sprayVolumeLHa) || 0}
          />
        </div>
      </div>
    </div>
  )
}
