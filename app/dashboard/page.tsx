import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        redirect("/sign-in")
    }

    return (
        <div>
            <h1>Welcome {session.user.name}</h1>
            <SignOutButton />
            <Link href="/delete-account">Delete Account</Link>
        </div>
    )
}