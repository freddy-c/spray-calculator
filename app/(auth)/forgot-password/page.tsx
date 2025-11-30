"use client"

import {
  ForgotPasswordForm,
  type ForgotPasswordFormValues,
} from "@/components/auth/forgot-password-form"
import { requestPasswordReset } from "@/lib/auth-client"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
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
    } catch (err) {
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
