"use client"

import { SignupForm, type SignupFormValues } from "@/components/auth/signup-form"
import { signUp } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: SignupFormValues) => {
    setError(null)
    setIsLoading(true)

    try {
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/sign-in",
      })

      if (res.error) {
        setError(res.error.message || "Something went wrong.")
      } else {
        // Redirect to check email page since email verification is required
        router.push(`/check-email?email=${encodeURIComponent(data.email)}`)
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
        <SignupForm onSubmit={handleSubmit} error={error} isLoading={isLoading} />
      </div>
    </div>
  )
}