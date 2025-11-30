import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { nextCookies } from "better-auth/next-js";
import { resend } from '@/lib/resend'
import { PasswordResetEmail } from '@/components/email/password-reset-email'
import { EmailVerificationEmail } from '@/components/email/email-verification-email'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    deleteUser: {
      enabled: true,
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Acme <onboarding@resend.dev>', // Replace with your verified domain
          to: user.email,
          subject: 'Reset your password',
          react: PasswordResetEmail({
            resetUrl: url,
            userName: user.name
          }),
        })

        if (error) {
          console.error('Failed to send password reset email:', error)
          throw error
        }

        console.log(`Password reset email sent to ${user.email}`)
      } catch (error) {
        console.error('Failed to send password reset email:', error)
        throw error
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name: string }; url: string }) => {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Acme <onboarding@resend.dev>', // Replace with your verified domain
          to: user.email,
          subject: 'Verify your email address',
          react: EmailVerificationEmail({
            verificationUrl: url,
            userName: user.name
          }),
        })

        if (error) {
          console.error('Failed to send verification email:', error)
          throw error
        }

        console.log(`Verification email sent to ${user.email}`)
      } catch (error) {
        console.error('Failed to send verification email:', error)
        throw error
      }
    },
    sendOnSignIn: true,
    sendOnSignUp: true,
  },
  trustedOrigins: [
    "https://refactored-goldfish-54rxxwvx544c79p5-3000.app.github.dev",
    "http://localhost:3000",
  ],
  plugins: [nextCookies()]
})