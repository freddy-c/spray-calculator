"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data);
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Spray Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller name="nozzleId" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="input-nozzle">
                    Nozzle
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-rhf-select-language"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem key={"syngenta-025-xc"} value="syngenta-025-xc">Syngenta 025 XC</SelectItem>
                        <SelectItem key={"syngenta-04-xc"} value="syngenta-04-xc">Syngenta 04 XC</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )} />

              <Controller name="sprayVolumeLHa" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="input-sprayVolumeLHa">
                    Spray volume (L/ha)
                  </FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    inputMode="numeric"
                    id="sprayVolumeLHa"
                    aria-invalid={fieldState.invalid}
                    placeholder="Spray volume"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )} />

              <Controller name="nozzleSpacingM" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="input-nozzleSpacingM">
                    Nozzle spacing (m)
                  </FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    inputMode="numeric"
                    id="nozzleSpacingM"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nozzle spacing"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )} />

              <Controller name="tankSizeL" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="input-tankSizeL">
                    Tank size (L)
                  </FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    inputMode="numeric"
                    id="tankSizeL"
                    aria-invalid={fieldState.invalid}
                    placeholder="Tank size"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )} />

              <Controller name="speedKmH" control={form.control} render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="input-speedKmH">
                    Speed (km/h) - {field.value}
                  </FieldLabel>
                  <Slider
                    min={3}
                    max={12}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )} />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="form">
            Submit
          </Button>
        </Field>
      </CardFooter>
      </Card>
    </div>
  );
}
