"use client"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push("/sign-in")
    }

    return (
        <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
            Sign Out
        </button>
    )
}
