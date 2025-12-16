'use client'

import { Toaster } from '@/components/ui/sonner'

/**
 * AppProviders component that wraps the application with all necessary providers
 * This is used both in the RootLayout and in tests to ensure consistent provider setup
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
