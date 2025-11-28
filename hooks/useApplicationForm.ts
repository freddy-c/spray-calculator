import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculateSprayMetrics, formSchema, type FormValues, type SprayMetrics } from "@/lib/application";

export function useApplicationForm() {
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
  });

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

  const metrics: SprayMetrics | null = useMemo(() => {
    const parsed = formSchema.safeParse(watchedValues);
    if (!parsed.success) return null;
    return calculateSprayMetrics(parsed.data);
  }, [watchedValues]);

  function onSubmit(data: FormValues) {
    console.log("Submitted data:", data);
  }

  return {
    form,
    control,
    areaFields,
    appendArea,
    removeArea,
    metrics,
    onSubmit: handleSubmit(onSubmit),
  };
}
