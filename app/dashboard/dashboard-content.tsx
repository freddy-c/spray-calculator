"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconClipboardList, IconPlus } from "@tabler/icons-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ApplicationsTable } from "./applications-table";
import type { ApplicationListItem, ApplicationStatus } from "@/lib/domain/application/types";
import { getApplications } from "@/lib/domain/application/actions";

type DashboardContentProps = {
  initialApplications: ApplicationListItem[];
  initialPageCount: number;
  pageSize: number;
};

export function DashboardContent({
  initialApplications,
  initialPageCount,
  pageSize,
}: DashboardContentProps) {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [applications, setApplications] = useState(initialApplications);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [, startTransition] = useTransition();

  const fetchApplications = (status: ApplicationStatus | "all", page: number) => {
    startTransition(async () => {
      const result = await getApplications({ page, pageSize, status });

      startTransition(() => {
        if (result.success) {
          setApplications(result.data.data);
          setPageCount(result.data.pageCount);
        } else {
          console.error("Failed to fetch applications:", result.error);
        }
      });
    });
  };

  const handleTabChange = (value: string) => {
    const status = value as ApplicationStatus | "all";
    setCurrentStatus(status);
    setCurrentPage(0);
    fetchApplications(status, 0);
  };

  const handlePageChange = (page: number) => {
    fetchApplications(currentStatus, page);
    setCurrentPage(page);
  };

  const handleDataChange = () => {
    fetchApplications(currentStatus, currentPage);
  };

  // Show empty state when no applications exist at all (across all statuses)
  const hasNoApplications = initialApplications.length === 0 && currentStatus === "all" && currentPage === 0;

  if (hasNoApplications) {
    return (
      <div className="w-full flex-1 rounded-lg border border-dashed">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconClipboardList />
            </EmptyMedia>
            <EmptyTitle>No applications yet</EmptyTitle>
            <EmptyDescription>Create your first spray application to get started.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/applications/new">
                <IconPlus />
                <span className="hidden lg:inline">New Application</span>
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={currentStatus} onValueChange={handleTabChange}>
        <div className="flex">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft</TabsTrigger>
            <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          </TabsList>
          <div className="ml-auto">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/applications/new">
                <IconPlus />
                <span className="hidden lg:inline">New Application</span>
              </Link>
            </Button>
          </div>
        </div>
        <TabsContent value={currentStatus} className="overflow-hidden">
          <ApplicationsTable
            applications={applications}
            pageCount={pageCount}
            pageIndex={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onDataChange={handleDataChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}