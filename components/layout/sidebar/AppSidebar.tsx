"use client"

import { IconClipboardList, IconDashboard, IconGolf, IconMap } from "@tabler/icons-react"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import { redirect } from "next/navigation";

const data = {
    navMain: [
        {
            title: "Applications",
            url: "/dashboard/",
            icon: IconClipboardList,
        },
        {
            title: "Areas",
            url: "/dashboard/areas",
            icon: IconMap,
        }
    ]
}

export function AppSidebar({ session, ...props }: { session: any } & React.ComponentProps<typeof Sidebar>) {
    if (!session) {
        redirect("/sign-in")
    }

    const user = {
        name: session.user.name,
        email: session.user.email,
        avatar: "",
    }

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <IconGolf className="!size-5" />
                                <span className="text-base font-semibold">Greenkeeper Inc.</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
}