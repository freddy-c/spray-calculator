import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApplications } from "@/lib/domain/application/actions";
import { Button } from "@/components/ui/button";
import { IconClipboardList } from "@tabler/icons-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DashboardContent } from "./dashboard-content";
import { DASHBOARD_CONFIG } from "./config";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/sign-in")
    }

    const result = await getApplications({ page: 0, pageSize: DASHBOARD_CONFIG.PAGE_SIZE, status: "all" });

    if (!result.success) {
        return (
            <div className="w-full flex-1 rounded-lg border border-destructive/50 bg-destructive/10">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <IconClipboardList className="text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>Failed to Load Applications</EmptyTitle>
                        <EmptyDescription>
                            {result.error || "An unexpected error occurred while loading your applications."}
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard">Try Again</Link>
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    const { data: applications, pageCount } = result.data;

    return (
        <DashboardContent
            initialApplications={applications}
            initialPageCount={pageCount}
            pageSize={DASHBOARD_CONFIG.PAGE_SIZE}
        />
    )
}