"use client"

import { ForgotPasswordForm } from "@/components/features/auth"
import { requestPasswordReset } from "@/lib/core/auth/client"
import { type ForgotPasswordInput } from "@/lib/core/auth"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ForgotPasswordInput) => {
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    try {
      const res = await requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      })

      if (res.error) {
        setError(res.error.message || "Something went wrong.")
      } else {
        setSuccess(true)
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
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          error={error}
          success={success}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
