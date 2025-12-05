/**
 * Mock Better Auth functions for testing
 *
 * Better Auth's api.getSession() returns:
 * - `{ user: User, session: Session }` when authenticated
 * - `null` when unauthenticated
 */

import { vi } from 'vitest'
import { createMockUser, createMockSession } from '../factories/user.factory'

// Default mock session response matching Better Auth structure
export const mockSessionResponse = {
  user: createMockUser(),
  session: createMockSession(),
}

// Mock auth object that matches better-auth's structure
export const mockAuth = {
  api: {
    getSession: vi.fn(async (_context): Promise<typeof mockSessionResponse | null> => mockSessionResponse),
  },
}

// Mock for unauthenticated state
export const mockNoSession = {
  api: {
    getSession: vi.fn(async (_context) => null),
  },
}

/**
 * Helper to mock authenticated user in tests
 * Returns the mocked user and session for use in test assertions
 *
 * @example
 * const { user, session } = mockAuthenticatedUser({
 *   id: 'custom-id',
 *   name: 'Custom User'
 * })
 */
export const mockAuthenticatedUser = (userOverrides = {}, sessionOverrides = {}) => {
  const user = createMockUser(userOverrides)
  const session = createMockSession({ ...sessionOverrides, userId: user.id })

  const response = { user, session }

  mockAuth.api.getSession.mockResolvedValue(response)

  return response
}

/**
 * Helper to mock unauthenticated state in tests
 *
 * @example
 * mockUnauthenticatedUser()
 * const result = await createApplication(data)
 * expect(result.error).toBe('Unauthorized')
 */
export const mockUnauthenticatedUser = () => {
  mockAuth.api.getSession.mockResolvedValue(null)
}