"use client"

import {
  ResetPasswordForm,
  type ResetPasswordFormValues,
} from "@/components/auth/reset-password-form"
import { resetPassword } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError("Invalid or missing reset token. Please request a new password reset link.")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (data: ResetPasswordFormValues) => {
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
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {!token && error ? (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
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
