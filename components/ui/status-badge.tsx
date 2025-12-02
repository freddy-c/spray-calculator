import { ApplicationStatus } from "@/lib/application/types";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    [ApplicationStatus.DRAFT]: {
      label: "Draft",
      className: "bg-gray-100 text-gray-800 border-gray-300",
    },
    [ApplicationStatus.SCHEDULED]: {
      label: "Scheduled",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    [ApplicationStatus.COMPLETED]: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-300",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
