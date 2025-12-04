"use client"

import { ResetPasswordForm } from "@/components/features/auth"
import { resetPassword } from "@/lib/core/auth/client"
import { type ResetPasswordInput } from "@/lib/core/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Derive token directly from URL params
  const token = searchParams.get("token")
  const tokenError = !token ? "Invalid or missing reset token. Please request a new password reset link." : null

  const handleSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError("Invalid or missing reset token.")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const res = await resetPassword({
        newPassword: data.password,
        token,
      })

      if (res.error) {
        setError(res.error.message || "Something went wrong.")
      } else {
        // Successfully reset password, redirect to sign in
        router.push("/sign-in?reset=success")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {tokenError ? (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {tokenError}
          </div>
        ) : (
          <ResetPasswordForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="rounded-md bg-gray-50 border border-gray-200 p-4 text-sm text-gray-800">
            Loading...
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
