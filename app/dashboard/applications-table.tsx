"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { IconCircleCheckFilled, IconClockFilled } from "@tabler/icons-react";
import { deleteApplication } from "@/lib/domain/application/actions";
import { toast } from "sonner";
import type { ApplicationListItem } from "@/lib/domain/application/types";

const statusConfig: Record<
  string,
  {
    icon?: React.ComponentType<{ className?: string }>;
    iconClassName?: string;
    label: string;
  }
> = {
  COMPLETED: {
    icon: IconCircleCheckFilled,
    iconClassName: "fill-green-500",
    label: "Completed",
  },
  SCHEDULED: {
    icon: IconClockFilled,
    iconClassName: "fill-blue-500",
    label: "Scheduled",
  },
  DRAFT: {
    label: "Draft",
  },
};

type ApplicationsTableProps = {
  applications: ApplicationListItem[];
};

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
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
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Area (ha)</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => {
            const { icon: StatusIcon, iconClassName, label } = statusConfig[application.status];

            return (
              <TableRow key={application.id} className="hover:bg-accent/50">
                <TableCell>
                  <Link
                    href={`/dashboard/applications/${application.id}`}
                    className="hover:underline"
                  >
                    {application.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-muted-foreground px-2">
                    {StatusIcon && <StatusIcon className={iconClassName} />}
                    {label}
                  </Badge>
                </TableCell>
                <TableCell>{application.totalAreaHa}</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  }).format(new Date(application.updatedAt))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/applications/${application.id}`}>
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/applications/${application.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(application.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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
