"use client"

import { DeleteAccountForm } from "@/components/features/auth"
import { deleteUser, signOut } from "@/lib/core/auth/client"
import { type DeleteAccountInput } from "@/lib/core/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function DeleteAccountPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: DeleteAccountInput) => {
    setError(null)
    setIsLoading(true)

    try {
      const res = await deleteUser({
        password: data.password,
      })

      if (res.error) {
        setError(res.error.message || "Failed to delete account. Please check your password and try again.")
      } else {
        // Account deleted successfully, sign out and redirect
        await signOut()
        router.push("/sign-in?deleted=true")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <DeleteAccountForm
          onSubmit={handleSubmit}
          error={error}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
