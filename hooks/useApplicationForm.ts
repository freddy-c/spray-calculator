import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculateSprayMetrics, formSchema, type FormValues, type SprayMetrics } from "@/lib/application";
import { createApplication, updateApplication } from "@/lib/actions/application";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UseApplicationFormProps = {
  initialValues?: Partial<FormValues>;
  mode?: "create" | "edit";
  applicationId?: string;
  onSuccess?: () => void;
};

const defaultFormValues: FormValues = {
  name: "",
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
};

export function useApplicationForm(props?: UseApplicationFormProps) {
  const { initialValues, mode = "create", applicationId, onSuccess } = props || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultFormValues,
      ...initialValues,
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

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      if (mode === "edit" && applicationId) {
        // Update existing application
        const result = await updateApplication(applicationId, data);

        if (result.success) {
          toast.success("Application updated successfully");
          onSuccess?.();
        } else {
          if (result.error === "Unauthorized") {
            toast.error("Please sign in to save applications");
            router.push("/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname));
          } else {
            toast.error(result.error);
          }
        }
      } else {
        // Create new application
        const result = await createApplication(data);

        if (result.success) {
          toast.success("Application saved successfully");
          onSuccess?.();
        } else {
          if (result.error === "Unauthorized") {
            toast.error("Please sign in to save applications");
            router.push("/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname));
          } else {
            toast.error(result.error);
          }
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    control,
    areaFields,
    appendArea,
    removeArea,
    metrics,
    isSubmitting,
    onSubmit: handleSubmit(onSubmit),
  };
}
