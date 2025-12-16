import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApplications } from "@/lib/domain/application/actions";
import { Button } from "@/components/ui/button";
import { IconClipboardList, IconPlus } from "@tabler/icons-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/sign-in")
    }

    const result = await getApplications({ page: 0, pageSize: 10, status: "all" });

    if (!result.success) {
        throw new Error(result.error || "Failed to fetch applications");
    }

    const { data: applications, pageCount, totalCount } = result.data;

    return (
        <div>
            {totalCount > 0 ? (
                <DashboardContent
                    initialApplications={applications}
                    initialPageCount={pageCount}
                />
            ) : (
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
            )
            }
        </div >
    )
}