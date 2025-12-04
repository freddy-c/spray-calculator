"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/core/auth/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push("/sign-in")
    }

    return (
        // <Button
        //     onClick={handleSignOut}
        //     variant="destructive"
        // >
        //     Sign Out
        // </Button>
        <span onClick={handleSignOut}>Sign out</span>
    )
}
