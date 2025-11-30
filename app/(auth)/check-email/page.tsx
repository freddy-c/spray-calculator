"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { sendVerificationEmail } from "@/lib/auth-client"

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  const handleResend = async () => {
    if (!email) return

    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const res = await sendVerificationEmail({
        email: email,
        callbackURL: "/sign-in",
      })

      if (res.error) {
        setResendError(res.error.message || "Failed to resend email.")
      } else {
        setResendSuccess(true)
      }
    } catch (err) {
      setResendError("An unexpected error occurred.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">Verification email sent!</p>
              {email && (
                <p className="mb-2">
                  We sent a verification link to <span className="font-semibold">{email}</span>
                </p>
              )}
              <p>Click the link in the email to verify your account and complete your registration.</p>
            </div>

            {resendSuccess && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                Verification email resent successfully!
              </div>
            )}

            {resendError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {resendError}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Didn&apos;t receive the email?</p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? "Resending..." : "Resend verification email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
