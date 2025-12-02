"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteApplication } from "@/lib/actions/application";
import { ApplicationStatus } from "@/lib/application/types";
import { Badge } from "@/components/ui/badge";
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
  status: ApplicationStatus;
  scheduledDate: Date | null;
  completedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  totalAreaHa: number;
};

type ApplicationListProps = {
  applications: Application[];
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  let text: string = "";

  switch (status) {
    case ApplicationStatus.DRAFT:
      text = "Draft";
      break;
    case ApplicationStatus.SCHEDULED:
      text = "Scheduled";
      break;
    case ApplicationStatus.COMPLETED:
      text = "Completed";
      break;
    default:
      text = status;
  }

  return <Badge variant="outline">{text}</Badge>;
}

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
              <th className="text-left p-4 font-semibold hidden lg:table-cell">Status</th>
              <th className="text-left p-4 font-semibold hidden sm:table-cell">Total Area (ha)</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">Last Updated</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t hover:bg-muted/50">
                <td className="p-4">
                  <Link href={`/dashboard/applications/${app.id}`} className="block hover:underline">
                    <div className="font-medium">{app.name}</div>
                  </Link>
                  <div className="text-sm text-muted-foreground sm:hidden mt-1">
                    {app.totalAreaHa.toFixed(3)} ha
                  </div>
                  <div className="mt-1 lg:hidden">
                    <StatusBadge status={app.status} />
                  </div>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <StatusBadge status={app.status} />
                </td>
                <td className="p-4 hidden sm:table-cell">{app.totalAreaHa.toFixed(3)}</td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">
                  {formatDate(app.updatedAt)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/applications/${app.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/applications/${app.id}/edit`}>
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
