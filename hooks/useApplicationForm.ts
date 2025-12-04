import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculateSprayMetrics, createApplicationSchema, type CreateApplicationInput, type CreateApplicationOutput, type SprayMetrics } from "@/lib/domain/application";
import { createApplication, updateApplication } from "@/lib/domain/application/actions";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";



type UseApplicationFormProps =
  | {
    mode?: "create";
    initialValues?: Partial<CreateApplicationOutput>;
    applicationId?: string;
    onSuccess?: () => void;
  }
  | {
    mode: "edit";
    initialValues: Partial<CreateApplicationOutput>;
    applicationId: string;
    onSuccess?: () => void;
  };

const defaultFormValues: CreateApplicationOutput = {
  name: "",
  nozzleId: "syngenta-025-xc",
  sprayVolumeLHa: 300,
  nozzleSpacingM: 0.5,
  nozzleCount: 40,
  tankSizeL: 400,
  speedKmH: 5,
  areas: [
    {
      label: "Greens",
      type: "green",
      sizeHa: 1,
    },
  ],
  products: [],
};

export function useApplicationForm(props?: UseApplicationFormProps) {
  const { initialValues, mode = "create", applicationId, onSuccess } = props || {};

  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<CreateApplicationInput, any, CreateApplicationOutput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      ...defaultFormValues,
      ...initialValues,
      areas: initialValues?.areas ?? defaultFormValues.areas,
      products: initialValues?.products ?? defaultFormValues.products,
    },

    mode: "onChange",
  });

  const { control, handleSubmit, watch, formState: { isSubmitting } } = form;

  const {
    fields: areaFields,
    append: appendArea,
    remove: removeArea,
  } = useFieldArray({
    control,
    name: "areas",
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "products",
  });

  const watchedValues = watch();

  const metrics: SprayMetrics | null = useMemo(() => {
    const parsed = createApplicationSchema.safeParse(watchedValues);
    if (!parsed.success) return null;
    return calculateSprayMetrics(parsed.data);
  }, [watchedValues]);

  async function handleCreate(data: CreateApplicationOutput) {
    const result = await createApplication(data);

    if (result.success) {
      toast.success("Application saved successfully");
      onSuccess?.();
      return;
    }

    toast.error(result.error);
  }

  async function handleUpdate(data: CreateApplicationOutput) {
    if (!applicationId) {
      console.error("Missing applicationId in edit mode");
      toast.error("Unable to update: missing application ID");
      return;
    }

    const result = await updateApplication(applicationId, data);

    if (result.success) {
      toast.success("Application updated successfully");
      onSuccess?.();
    } else if (result.error === "Unauthorized") {
      toast.error("Please sign in to save applications");
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
    } else {
      toast.error(result.error);
    }
  }

  async function onSubmit(data: CreateApplicationOutput) {
    try {
      if (mode === "edit") {
        await handleUpdate(data);
      } else {
        await handleCreate(data);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Form submission error:", error);
    }
  }

  return {
    form,
    control,
    areaFields,
    appendArea,
    removeArea,
    productFields,
    appendProduct,
    removeProduct,
    metrics,
    isSubmitting,
    onSubmit: handleSubmit(onSubmit),
  };
}
