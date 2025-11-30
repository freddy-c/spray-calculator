"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormValues) => void | Promise<void>
  error?: string | null
  success?: boolean
  isLoading?: boolean
  className?: string
}

export function ForgotPasswordForm({
  className,
  onSubmit,
  error,
  success,
  isLoading = false,
}: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                Password reset link sent! Check your email for instructions.
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </Field>

            <Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
              <FieldDescription className="text-center">
                Remember your password?{" "}
                <Link href="/sign-in" className="underline hover:text-primary">
                  Sign in
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
