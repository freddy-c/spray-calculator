"use client"

import { LoginForm, type LoginFormValues } from "@/components/auth/login-form"
import { signIn } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessMessage("Password reset successful! You can now sign in with your new password.")
    } else if (searchParams.get("verified") === "true") {
      setSuccessMessage("Email verified successfully! You can now sign in to your account.")
    } else if (searchParams.get("deleted") === "true") {
      setSuccessMessage("Your account has been successfully deleted.")
    } else if (searchParams.get("error") === "token_expired") {
      setError("Verification link has expired. Please request a new verification email by attempting to sign in again.")
    }
  }, [searchParams])

  const handleSubmit = async (data: LoginFormValues) => {
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    await signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/sign-in",
      },
      {
        onSuccess: () => {
          router.push("/dashboard")
        },
        onError: (ctx) => {
          // Unverified email case – Better Auth returns 403 for this
          if (ctx.error.status === 403) {
            router.push(`/check-email?email=${encodeURIComponent(data.email)}`)
          } else {
            setError(ctx.error.message || "Something went wrong.")
            setIsLoading(false)
          }
        },
      }
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-4">
        {successMessage && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}
        <LoginForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
      </div>
    </div>
  )
}