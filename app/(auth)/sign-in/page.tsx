"use client"

import { LoginForm } from "@/components/features/auth"
import { signIn } from "@/lib/core/auth/client"
import { type LoginInput } from "@/lib/core/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Derive success message directly from URL params
  const successMessage =
    searchParams.get("reset") === "success"
      ? "Password reset successful! You can now sign in with your new password."
      : searchParams.get("verified") === "true"
      ? "Email verified successfully! You can now sign in to your account."
      : searchParams.get("deleted") === "true"
      ? "Your account has been successfully deleted."
      : null

  // Derive error message directly from URL params
  const urlError =
    searchParams.get("error") === "token_expired"
      ? "Verification link has expired. Please request a new verification email by attempting to sign in again."
      : null

  const handleSubmit = async (data: LoginInput) => {
    setError(null)
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
        {urlError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {urlError}
          </div>
        )}
        <LoginForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default function SignInPage() {
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
      <SignInContent />
    </Suspense>
  )
}
