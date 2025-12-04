import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApplications } from "@/lib/domain/application/actions";
import { ApplicationList } from "./application-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconCircleCheckFilled, IconClipboardList, IconClockFilled, IconPlus } from "@tabler/icons-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

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
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead>
                                            Name
                                        </TableHead>

                                        <TableHead>
                                            Status
                                        </TableHead>

                                        <TableHead>
                                            Total Area (ha)
                                        </TableHead>
                                        <TableHead>
                                            Last Updated
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications
                                        .map((application) => {
                                            const { icon: StatusIcon, iconClassName, label } = statusConfig[application.status]

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
                                                        {new Intl.DateTimeFormat(undefined, {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hourCycle: "h23",
                                                        }).format(new Date(application.updatedAt))}

                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                </TableBody>
                            </Table>
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