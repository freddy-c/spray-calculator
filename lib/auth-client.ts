import { createAuthClient } from 'better-auth/react'

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  deleteUser,
} = createAuthClient()