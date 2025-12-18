import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculateSprayMetrics, createApplicationSchema, type CreateApplicationOutput, type SprayMetrics } from "@/lib/domain/application";
import { createApplication, updateApplication } from "@/lib/domain/application/actions";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import type { AreaListItem } from "@/lib/domain/area";



type UseApplicationFormProps = {
  mode?: "create" | "edit";
  initialValues?: Partial<CreateApplicationOutput>;
  applicationId?: string;
  onSuccess?: () => void;
  availableAreas: AreaListItem[];
};

const defaultFormValues: CreateApplicationOutput = {
  name: "",
  nozzleId: "syngenta-025-xc",
  sprayVolumeLHa: 300,
  nozzleSpacingM: 0.5,
  nozzleCount: 40,
  tankSizeL: 400,
  speedKmH: 5,
  areas: [],
  products: [],
};

export function useApplicationForm(props?: UseApplicationFormProps) {
  const { initialValues, mode = "create", applicationId, onSuccess, availableAreas = [] } = props || {};

  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
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

    // Transform form data to ApplicationDetail format with full area data
    const dataWithAreas = {
      ...parsed.data,
      areas: parsed.data.areas.map((area) => {
        const fullArea = availableAreas.find((a) => a.id === area.areaId);
        return {
          id: area.areaId,
          name: fullArea?.name ?? '',
          type: fullArea?.type ?? '',
          sizeHa: fullArea?.sizeHa ?? 0,
        };
      }),
    };

    return calculateSprayMetrics(dataWithAreas as any);
  }, [watchedValues, availableAreas]);

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
