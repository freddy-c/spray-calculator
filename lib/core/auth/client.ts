/**
 * Client-side auth exports
 * Safe to import in client components
 */

export {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  deleteUser,
} from "./auth-client";
