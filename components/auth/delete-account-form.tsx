"use client"

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
  confirmation: z.string(),
}).refine((data) => data.confirmation === "DELETE", {
  message: "Please type DELETE to confirm",
  path: ["confirmation"],
})

export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>

interface DeleteAccountFormProps {
  onSubmit: (data: DeleteAccountFormValues) => void | Promise<void>
  error?: string | null
  isLoading?: boolean
  className?: string
}

export function DeleteAccountForm({
  className,
  onSubmit,
  error,
  isLoading = false,
}: DeleteAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
  })

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-red-600">Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              <p className="font-medium mb-2">Warning: This action cannot be undone</p>
              <p>Deleting your account will permanently delete all your data.</p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="password">Confirm your password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmation">
                Type <span className="font-bold">DELETE</span> to confirm
              </FieldLabel>
              <Input
                id="confirmation"
                type="text"
                placeholder="DELETE"
                {...register("confirmation")}
              />
              {errors.confirmation && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmation.message}
                </p>
              )}
            </Field>

            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Deleting account..." : "Delete my account"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
