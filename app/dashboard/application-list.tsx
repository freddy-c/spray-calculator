"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteApplication } from "@/lib/actions/application";
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

type Application = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  totalAreaHa: number;
};

type ApplicationListProps = {
  applications: Application[];
};

export function ApplicationList({ applications }: ApplicationListProps) {
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    // Capture the id so we’re not relying on state after await
    const id = applicationToDelete;

    try {
      setIsDeleting(true);

      const result = await deleteApplication(id);

      if (result.success) {
        // setApplications((prev) => prev.filter((app) => app.id !== id));
        toast.success("Application deleted successfully");

        // Close the dialog
        setApplicationToDelete(null);

        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete application");
        // Optionally keep dialog open here so user can retry
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete application");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold hidden sm:table-cell">Total Area (ha)</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">Last Updated</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t hover:bg-muted/50">
                <td className="p-4">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-sm text-muted-foreground sm:hidden">
                    {app.totalAreaHa.toFixed(3)} ha
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">{app.totalAreaHa.toFixed(3)}</td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">
                  {formatDate(app.updatedAt)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/applications/${app.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(app.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                e.preventDefault(); // prevent Radix from auto-closing
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
