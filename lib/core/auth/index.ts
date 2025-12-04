/**
 * Core auth barrel exports
 *
 * For server-only code (auth instance), import from "@/lib/core/auth/server"
 * For client-only code (auth utilities), import from "@/lib/core/auth/client"
 * For shared code (schemas, types), import from this file
 */

// Validation schemas and types (safe for both server and client)
export {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  deleteAccountSchema,
  type LoginInput,
  type SignupInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type DeleteAccountInput,
} from "./schemas";
