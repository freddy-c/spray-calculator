import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import Link from "next/link";
import { getApplications } from "@/lib/actions/application";
import { ApplicationList } from "./application-list";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        redirect("/sign-in")
    }

    const result = await getApplications();
    const applications = result.success ? result.data : [];

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/applications/new">
                        <Button>New Application</Button>
                    </Link>
                    <SignOutButton />
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
                    <p className="text-muted-foreground mb-4">
                        Create your first spray application to get started.
                    </p>
                    <Link href="/applications/new">
                        <Button>Create Application</Button>
                    </Link>
                </div>
            ) : (
                <ApplicationList initialApplications={applications} />
            )}

            <div className="mt-8 pt-8 border-t">
                <Link href="/delete-account" className="text-sm text-muted-foreground hover:underline">
                    Delete Account
                </Link>
            </div>
        </div>
    )
}