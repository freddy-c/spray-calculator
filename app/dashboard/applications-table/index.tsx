"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { deleteApplication } from "@/lib/domain/application/actions";
import type { ApplicationListItem } from "@/lib/domain/application/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type ApplicationsTableProps = {
  applications: ApplicationListItem[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDataChange?: () => void;
};

export function ApplicationsTable({
  applications,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onDataChange,
}: ApplicationsTableProps) {
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    const id = applicationToDelete;

    try {
      setIsDeleting(true);

      const result = await deleteApplication(id);

      if (result.success) {
        toast.success("Application deleted successfully");
        setApplicationToDelete(null);
        onDataChange?.();
        router.refresh();
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
    <>
      <DataTable
        columns={columns}
        data={applications}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        meta={{ onDelete: handleDeleteClick }}
      />

      <AlertDialog
        open={applicationToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setApplicationToDelete(null);
          }
        }}
      >
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
    </>
  );
}