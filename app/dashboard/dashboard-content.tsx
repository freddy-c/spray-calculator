"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus } from "@tabler/icons-react";
import { ApplicationsTable } from "./applications-table";
import type { ApplicationListItem, ApplicationStatus } from "@/lib/domain/application/types";
import { getApplications } from "@/lib/domain/application/actions";

type DashboardContentProps = {
  initialApplications: ApplicationListItem[];
  initialPageCount: number;
};

export function DashboardContent({
  initialApplications,
  initialPageCount,
}: DashboardContentProps) {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [applications, setApplications] = useState(initialApplications);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const fetchApplications = async (status: ApplicationStatus | "all", page: number) => {
    startTransition(async () => {
      const result = await getApplications({ page, pageSize: 10, status });

      if (result.success) {
        setApplications(result.data.data);
        setPageCount(result.data.pageCount);
      }

      router.refresh();
    });
  };

  const handleTabChange = (value: string) => {
    const status = value as ApplicationStatus | "all";
    setCurrentStatus(status);
    setCurrentPage(0);
    fetchApplications(status, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchApplications(currentStatus, page);
  };

  const handleDataChange = () => {
    fetchApplications(currentStatus, currentPage);
  };

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
            pageSize={10}
            onPageChange={handlePageChange}
            onDataChange={handleDataChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}