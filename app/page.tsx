"use client";

import { useMemo } from "react";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
})

type PressureStatus = "ok" | "low" | "high";

type SprayMetrics = {
  flowPerNozzleLMin: number;
  requiredPressureBar: number;
  speedKmH: number;
  pressureStatus: PressureStatus;
};

function calculateSprayMetrics(values: z.infer<typeof formSchema>): SprayMetrics {
  const sprayVolume = values.sprayVolumeLHa;
  const nozzleSpacing = values.nozzleSpacingM;
  const speedKmH = values.speedKmH;

  const nozzle = nozzleCatalog[values.nozzleId];

  const flowPerNozzleLMin = (sprayVolume * speedKmH * nozzleSpacing) / 600;
  const requiredPressureBar = Math.pow(sprayVolume * speedKmH * nozzleSpacing / (600 * nozzle.kFactor), 2);
  
  const pressureStatus: PressureStatus =
    requiredPressureBar < nozzle.minPressureBar
      ? "low"
      : requiredPressureBar > nozzle.maxPressureBar
        ? "high"
        : "ok";

  return {
    flowPerNozzleLMin,
    requiredPressureBar,
    speedKmH,
    pressureStatus,
  };
}

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nozzleId: "syngenta-025-xc",
      sprayVolumeLHa: 300,
      nozzleSpacingM: 0.5,
      tankSizeL: 400,
      speedKmH: 5,
    },
    mode: "onChange",
  })

  const watchedValues = form.watch();

  const metrics = useMemo(() => {
    const parsed = formSchema.safeParse(watchedValues);
    if (!parsed.success) {
      return null;
    }

    return calculateSprayMetrics(parsed.data);
  }, [watchedValues]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b">
          <CardTitle>Spray Calculator</CardTitle>
          <CardDescription>
            Tune your spray settings and see pressure and flow update instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="spray-calculator-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
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

              <FieldSeparator />

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

              <FieldSeparator />

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
                      // className="sm:max-w-[8rem]"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <FieldSeparator />

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
                      // className="sm:max-w-[8rem]"
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <FieldSeparator />

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

              <FieldSeparator>
                Live metrics
              </FieldSeparator> 
            </FieldGroup>

            {/* <FieldSeparator>
              Live metrics
            </FieldSeparator> */}
            

            <div className="mt-4 space-y-4">
              <FieldDescription>Values update as you adjust any setting.</FieldDescription>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-sm text-muted-foreground">Nozzle flow</p>
                  <p className="text-xl font-semibold">{metrics ? metrics.flowPerNozzleLMin.toFixed(2) : "—"} L/min</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-sm text-muted-foreground">Pressure</p>
                  <p className={`text-xl font-semibold ${metrics?.pressureStatus === "ok" ? "text-emerald-700" : "text-destructive" }`}>
                    {metrics ? metrics.requiredPressureBar.toFixed(2) : "—"} bar
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-sm text-muted-foreground">Speed</p>
                  <p className="text-xl font-semibold">{metrics ? metrics.speedKmH.toFixed(2) : "—"} km/h</p>
                </div>
              </div>
              { metrics?.pressureStatus !== "ok" && (
                <div className="rounded-md border p-3 border-destructive/30 bg-destructive/5">
                  <p className="text-sm text-destructive">
                    {metrics?.pressureStatus === "low" && "Pressure is below the recommended range — consider increasing speed or increasing spray volume."}
                    {metrics?.pressureStatus === "high" && "Pressure is above the recommended range — consider reducing speed or reducing spray volume."}
                    {!metrics && "Enter values to see pressure guidance."}
                  </p>
                </div>
              )}
            </div>
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
    </div>
  )
}
