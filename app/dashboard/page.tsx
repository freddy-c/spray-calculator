import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApplications } from "@/lib/domain/application/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconClipboardList, IconPlus } from "@tabler/icons-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ApplicationsTable } from "./applications-table";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/sign-in")
    }

    const result = await getApplications();
    const applications = result.success ? result.data : [];
    // const applications = [];

    return (
        <div>
            {applications.length > 0 ? (
                <div className="space-y-4">
                    <Tabs defaultValue="all">
                        <div className="flex">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="Draft">Draft</TabsTrigger>
                                <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
                                <TabsTrigger value="Completed">Completed</TabsTrigger>
                            </TabsList>
                            <div className="ml-auto">
                                <Button variant="outline" size="sm" >
                                    <IconPlus />
                                    <Link href="/dashboard/applications/new" className="hidden lg:inline">New Application</Link>
                                </Button>
                            </div>
                        </div>
                        <TabsContent value="all" className="overflow-hidden rounded-lg border">
                            <ApplicationsTable applications={applications} />
                        </TabsContent>
                    </Tabs>
                </div >
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
                            <Button variant="outline" size="sm" >
                                <IconPlus />
                                <Link href="/dashboard/applications/new" className="hidden lg:inline">New Application</Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                </div>
            )
            }
        </div >
    )
}