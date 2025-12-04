import { z } from "zod";

/**
 * Schema for login form
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Schema for signup form
 */
export const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be at most 128 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be at most 128 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Schema for forgot password form
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

/**
 * Schema for reset password form
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Schema for delete account form
 */
export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Password is required to delete your account"),
    confirmation: z.string(),
  })
  .refine((data) => data.confirmation === "DELETE", {
    message: "Please type DELETE to confirm",
    path: ["confirmation"],
  });

/**
 * Inferred types from schemas - exported for convenience
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
