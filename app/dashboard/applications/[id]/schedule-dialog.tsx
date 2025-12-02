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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { scheduleApplication } from "@/lib/actions/application";
import { scheduleSchema } from "@/lib/application/schemas";
import { toast } from "sonner";
import type { z } from "zod";

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

type ScheduleDialogProps = {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScheduleDialog({
  applicationId,
  open,
  onOpenChange,
}: ScheduleDialogProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      scheduledDate: "",
    },
  });

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      const result = await scheduleApplication(applicationId, {
        scheduledDate: new Date(data.scheduledDate),
      });

      if (result.success) {
        toast.success("Application scheduled successfully");
        reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to schedule application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule application");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Schedule Application</DialogTitle>
            <DialogDescription>
              Set when this application will be performed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Controller
              name="scheduledDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="scheduledDate">Scheduled Date</FieldLabel>
                  <Input
                    {...field}
                    id="scheduledDate"
                    type="date"
                    disabled={isSubmitting}
                    aria-invalid={fieldState.invalid}
                  />
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
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
