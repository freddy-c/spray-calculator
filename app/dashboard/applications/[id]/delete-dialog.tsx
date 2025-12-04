"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/lib/domain/application/actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteApplicationDialogProps = {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfterDelete?: string;
};

export function DeleteApplicationDialog({
  applicationId,
  open,
  onOpenChange,
  redirectAfterDelete,
}: DeleteApplicationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteApplication(applicationId);

      if (result.success) {
        toast.success("Application deleted successfully");
        onOpenChange(false);

        if (redirectAfterDelete) {
          router.push(redirectAfterDelete);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error || "Failed to delete application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete application");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Application</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this application? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleDeleteConfirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
