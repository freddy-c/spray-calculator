"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconCircleCheckFilled, IconClockFilled } from "@tabler/icons-react";
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

export const columns: ColumnDef<ApplicationListItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/applications/${row.original.id}`}
          className="hover:underline"
        >
          {row.getValue("name")}
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const { icon: StatusIcon, iconClassName, label } = statusConfig[status];

      return (
        <Badge variant="outline" className="text-muted-foreground px-2">
          {StatusIcon && <StatusIcon className={iconClassName} />}
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalAreaHa",
    header: () => <div>Total Area (ha)</div>,
    cell: ({ row }) => {
      return <div>{row.getValue("totalAreaHa")}</div>;
    },
  },
  {
    accessorKey: "formattedUpdatedAt",
    header: () => <div>Last Updated</div>,
    cell: ({ row }) => {
      return <div>{row.getValue("formattedUpdatedAt")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const application = row.original;
      const onDelete = (table.options.meta as { onDelete?: (id: string) => void })?.onDelete;

      return (
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
              onClick={() => onDelete?.(application.id)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
