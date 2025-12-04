"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationStatus } from "@/lib/domain/application/types";
import { revertToDraft } from "@/lib/domain/application/actions";
import { toast } from "sonner";
import { ChevronDown, Circle, CheckCircle2 } from "lucide-react";
import { ScheduleDialog } from "./schedule-dialog";
import { CompleteDialog } from "./complete-dialog";
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

type StatusDropdownProps = {
  applicationId: string;
  currentStatus: ApplicationStatus;
};

export function StatusDropdown({ applicationId, currentStatus }: StatusDropdownProps) {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [revertToDraftDialogOpen, setRevertToDraftDialogOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const router = useRouter();

  const handleStatusClick = (targetStatus: ApplicationStatus) => {
    if (targetStatus === currentStatus) {
      // Clicking current status = update details
      if (targetStatus === ApplicationStatus.SCHEDULED) {
        setScheduleDialogOpen(true);
      } else if (targetStatus === ApplicationStatus.COMPLETED) {
        setCompleteDialogOpen(true);
      }
      // Draft has no details to update
    } else {
      // Transitioning to a different status
      if (targetStatus === ApplicationStatus.DRAFT) {
        setRevertToDraftDialogOpen(true);
      } else if (targetStatus === ApplicationStatus.SCHEDULED) {
        setScheduleDialogOpen(true);
      } else if (targetStatus === ApplicationStatus.COMPLETED) {
        setCompleteDialogOpen(true);
      }
    }
  };

  const handleRevertToDraft = async () => {
    setIsReverting(true);
    try {
      const result = await revertToDraft(applicationId);

      if (result?.success) {
        toast.success("Application reverted to draft");
        setRevertToDraftDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result?.error || "Failed to revert application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to revert application");
    } finally {
      setIsReverting(false);
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.DRAFT:
        return "Draft";
      case ApplicationStatus.SCHEDULED:
        return "Scheduled";
      case ApplicationStatus.COMPLETED:
        return "Completed";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    if (status === currentStatus) {
      return <CheckCircle2 className="h-4 w-4 mr-2" />;
    }
    return <Circle className="h-4 w-4 mr-2 opacity-40" />;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {getStatusLabel(currentStatus)}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusClick(ApplicationStatus.DRAFT)}
          >
            {getStatusIcon(ApplicationStatus.DRAFT)}
            <span className={currentStatus === ApplicationStatus.DRAFT ? "font-semibold" : ""}>
              Draft
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusClick(ApplicationStatus.SCHEDULED)}
          >
            {getStatusIcon(ApplicationStatus.SCHEDULED)}
            <span className={currentStatus === ApplicationStatus.SCHEDULED ? "font-semibold" : ""}>
              Scheduled
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusClick(ApplicationStatus.COMPLETED)}
          >
            {getStatusIcon(ApplicationStatus.COMPLETED)}
            <span className={currentStatus === ApplicationStatus.COMPLETED ? "font-semibold" : ""}>
              Completed
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ScheduleDialog
        applicationId={applicationId}
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />

      <CompleteDialog
        applicationId={applicationId}
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      />

      <AlertDialog open={revertToDraftDialogOpen} onOpenChange={setRevertToDraftDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert this application to Draft?
              {currentStatus === ApplicationStatus.COMPLETED &&
                " This will clear the completion details."}
              {currentStatus === ApplicationStatus.SCHEDULED &&
                " This will clear the scheduled date."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReverting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRevertToDraft();
              }}
              disabled={isReverting}
            >
              {isReverting ? "Reverting..." : "Revert to Draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
