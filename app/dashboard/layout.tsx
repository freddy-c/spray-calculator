import { AppSidebar, SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { CSSProperties } from "react";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return (
        <div>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 60)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as CSSProperties
                }
            >
                <AppSidebar variant="inset" session={session} />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </SidebarInset>


            </SidebarProvider>
        </div>
    )
}