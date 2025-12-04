"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { completeApplication } from "@/lib/domain/application/actions";
import { completeApplicationSchema, type CompleteApplicationInput } from "@/lib/domain/application/schemas";
import { toast } from "sonner";

type CompleteDialogProps = {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CompleteDialog({
  applicationId,
  open,
  onOpenChange,
}: CompleteDialogProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CompleteApplicationInput>({
    resolver: zodResolver(completeApplicationSchema),
    defaultValues: {
      completedDate: "",
      operator: "",
      weatherConditions: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CompleteApplicationInput) => {
    try {
      const result = await completeApplication(applicationId, data);

      if (result.success) {
        toast.success("Application completed successfully");
        reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to complete application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete application");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Complete Application</DialogTitle>
            <DialogDescription>
              Record the completion details for this application.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Controller
              name="completedDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="completedDate">Completed Date *</FieldLabel>
                  <Input
                    {...field}
                    id="completedDate"
                    type="date"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="operator"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="operator">Operator</FieldLabel>
                  <Input
                    {...field}
                    id="operator"
                    type="text"
                    placeholder="Enter operator name"
                    maxLength={100}
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Optional: Who performed the application</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="weatherConditions"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="weatherConditions">Weather Conditions</FieldLabel>
                  <Input
                    {...field}
                    id="weatherConditions"
                    type="text"
                    placeholder="e.g., Sunny, 20°C, light breeze"
                    maxLength={200}
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Optional: Weather during application</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="notes">Notes</FieldLabel>
                  <Textarea
                    {...field}
                    id="notes"
                    rows={4}
                    placeholder="Any additional notes about the application..."
                    maxLength={1000}
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Optional: Additional notes or observations</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Completing..." : "Complete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
