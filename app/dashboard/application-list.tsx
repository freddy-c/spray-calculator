"use client";

import { useState } from "react";
import Link from "next/link";
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
  initialApplications: Application[];
};

export function ApplicationList({ initialApplications }: ApplicationListProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);

    const result = await deleteApplication(applicationToDelete);

    if (result.success) {
      setApplications((prev) => prev.filter((app) => app.id !== applicationToDelete));
      toast.success("Application deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete application");
    }

    setIsDeleting(false);
    setApplicationToDelete(null);
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

      <AlertDialog open={applicationToDelete !== null} onOpenChange={(open) => !open && setApplicationToDelete(null)}>
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
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
